import 'mocha'
import * as assert from 'assert'
import {join as joinPath} from 'path'
import {MockProvider} from './utils/mock-provider'

import {Action} from '../src/chain/action'
import {APIClient} from '../src/api/client'
import {Asset} from '../src/chain/asset'
import {Name} from '../src/chain/name'
import {PrivateKey} from '../src/chain/private-key'
import {SignedTransaction, Transaction} from '../src/chain/transaction'
import {Struct} from '../src/chain/struct'

const util = require('util');

const client = new APIClient({
    provider: new MockProvider(joinPath(__dirname, 'data')),
})

suite('api v1', function () {
    this.slow(200)

    test('chain get_account', async function() {
      const account = await client.v1.chain.get_account('teamgreymass')
      assert.equal(
        account.account_name,
        'teamgreymass'
      )
    })

    test('chain get_account (system account)', async function() {
      const account = await client.v1.chain.get_account('eosio')
      assert.equal(
        account.account_name,
        'eosio'
      )
    })

    test('chain get_info', async function () {
        const info = await client.v1.chain.get_info()
        assert.equal(
            info.chain_id.hexString,
            '2a02a0053e5a8cf73a56ba0fda11e4d92e0238a4a2aa74fccf46d5a910746840'
        )
    })

    test('chain push_transaction', async function () {
        @Struct.type('transfer')
        class Transfer extends Struct {
            @Struct.field('name') from!: Name
            @Struct.field('name') to!: Name
            @Struct.field('asset') quantity!: Asset
            @Struct.field('string') memo!: string
        }
        const info = await client.v1.chain.get_info()
        const header = info.getTransactionHeader()
        const action = Action.from({
            authorization: [
                {
                    actor: 'corecorecore',
                    permission: 'active',
                },
            ],
            account: 'eosio.token',
            name: 'transfer',
            data: Transfer.from({
                from: 'corecorecore',
                to: 'teamgreymass',
                quantity: '0.0042 EOS',
                memo: 'eosio-core is the best <3',
            }),
        })
        const transaction = Transaction.from({
            ...header,
            actions: [action],
        })
        const privateKey = PrivateKey.from('5JW71y3njNNVf9fiGaufq8Up5XiGk68jZ5tYhKpy69yyU9cr7n9')
        const signature = privateKey.signDigest(transaction.signingDigest(info.chain_id))
        const signedTransaction = SignedTransaction.from({
            ...transaction,
            signatures: [signature],
        })
        const result = await client.v1.chain.push_transaction(signedTransaction)
        assert.equal(result.transaction_id, transaction.id.hexString)
    })
})
