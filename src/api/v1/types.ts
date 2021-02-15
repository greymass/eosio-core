import {
    ABI,
    Asset,
    Authority,
    Bytes,
    Checksum160,
    Checksum256,
    Float128,
    Float64,
    Int128,
    Int32,
    Int64,
    Name,
    NameType,
    PublicKey,
    Signature,
    Struct,
    TimePoint,
    TimePointSec,
    TransactionHeader,
    TransactionReceipt,
    UInt16,
    UInt32,
    UInt32Type,
    UInt64,
} from '../../chain'

import {ABISerializableType} from '../../serializer'

@Struct.type('account_permission')
export class AccountPermission extends Struct {
    @Struct.field('name') perm_name!: Name
    @Struct.field('name') parent!: Name
    @Struct.field(Authority) required_auth!: Authority
}

@Struct.type('account_resource_limit')
export class AccountResourceLimit extends Struct {
    @Struct.field('int32') used!: Int32
    @Struct.field('int32') available!: Int32
    @Struct.field('int32') max!: Int32
}

@Struct.type('account_total_resources')
export class AccountTotalResources extends Struct {
    @Struct.field('name') owner!: Name
    @Struct.field('asset') net_weight!: Asset
    @Struct.field('asset') cpu_weight!: Asset
    @Struct.field('uint64') ram_bytes!: UInt64
}

@Struct.type('account_self_delegated_bandwidth')
export class AccountSelfDelegatedBandwidth extends Struct {
    @Struct.field('name') from!: Name
    @Struct.field('name') to!: Name
    @Struct.field('asset') net_weight!: Asset
    @Struct.field('asset') cpu_weight!: Asset
}

@Struct.type('account_refund_request')
export class AccountRefundRequest extends Struct {
    @Struct.field('name') owner!: Name
    @Struct.field('time_point') request_time!: TimePoint
    @Struct.field('asset') net_amount!: Asset
    @Struct.field('asset') cpu_amount!: Asset
}

@Struct.type('account_voter_info')
export class AccountVoterInfo extends Struct {
    @Struct.field('name') owner!: Name
    @Struct.field('name') proxy!: Name
    @Struct.field('name', {array: true}) producers!: Name[]
    @Struct.field('int64', {optional: true}) staked?: Int64
    // @Struct.field('float64') last_vote_weight!: Float64
    // @Struct.field('float64') proxied_vote_weight!: Float64
    @Struct.field('bool') is_proxy!: boolean
    @Struct.field('uint32', {optional: true}) flags1?: UInt32
    @Struct.field('uint32') reserved2!: UInt32
    @Struct.field('string') reserved3!: string
}

@Struct.type('account_rex_info_maturities')
export class AccountRexInfoMaturities extends Struct {
    @Struct.field('time_point', {optional: true}) key?: TimePoint
    @Struct.field('time_point', {optional: true}) first?: TimePoint
    @Struct.field('int64', {optional: true}) value?: Int64
    @Struct.field('int64', {optional: true}) second?: Int64
}

@Struct.type('account_rex_info')
export class AccountRexInfo extends Struct {
    @Struct.field('uint32') version!: UInt32
    @Struct.field('name') owner!: Name
    @Struct.field('asset') vote_stake!: Asset
    @Struct.field('asset') rex_balance!: Asset
    @Struct.field('int64') matured_rex!: Int64
    @Struct.field(AccountRexInfoMaturities, {array: true})
    rex_maturities!: AccountRexInfoMaturities[]
}

export interface GetAbiResponse {
    account_name: string
    abi?: ABI.Def
}

@Struct.type('account_object')
export class AccountObject extends Struct {
    /** The account name of the retrieved account */
    @Struct.field('name') account_name!: Name
    /** Highest block number on the chain */
    @Struct.field('uint32') head_block_num!: UInt32
    /** Highest block unix timestamp. */
    @Struct.field('time_point') head_block_time!: TimePoint
    /** Indicator of if this is a privileged system account */
    @Struct.field('bool') privileged!: boolean
    /** Last update to accounts contract as unix timestamp. */
    @Struct.field('time_point') last_code_update!: TimePoint
    /** Account created as unix timestamp. */
    @Struct.field('time_point') created!: TimePoint
    /** Account core token balance */
    @Struct.field('asset?') core_liquid_balance?: Asset
    @Struct.field('int64') ram_quota!: Int64
    @Struct.field('int64') net_weight!: Int64
    @Struct.field('int64') cpu_weight!: Int64
    @Struct.field(AccountResourceLimit) net_limit!: AccountResourceLimit
    @Struct.field(AccountResourceLimit) cpu_limit!: AccountResourceLimit
    @Struct.field('uint64') ram_usage!: UInt64
    @Struct.field(AccountPermission, {array: true}) permissions!: AccountPermission[]
    @Struct.field(AccountTotalResources) total_resources!: AccountTotalResources
    @Struct.field(AccountSelfDelegatedBandwidth, {optional: true})
    self_delegated_bandwidth?: AccountSelfDelegatedBandwidth
    @Struct.field(AccountRefundRequest, {optional: true}) refund_request?: AccountRefundRequest
    @Struct.field(AccountVoterInfo, {optional: true}) voter_info?: AccountVoterInfo
    @Struct.field(AccountRexInfo, {optional: true}) rex_info?: AccountRexInfo

    getPermission(permission: NameType): AccountPermission {
        const name = Name.from(permission)
        const match = this.permissions.find((p) => p.perm_name.equals(name))
        if (!match) {
            throw new Error(`Unknown permission ${name} on account ${this.account_name}.`)
        }
        return match
    }
}

@Struct.type('new_producers_entry')
export class NewProducersEntry extends Struct {
    @Struct.field('name') producer_name!: Name
    @Struct.field('public_key') block_signing_key!: PublicKey
}

@Struct.type('new_producers')
export class NewProducers extends Struct {
    @Struct.field('uint32') version!: UInt32
    @Struct.field(NewProducersEntry, {array: true}) producers!: NewProducersEntry
}

@Struct.type('block_extension')
export class BlockExtension extends Struct {
    @Struct.field('uint16') type!: UInt16
    @Struct.field('bytes') data!: Bytes
}

@Struct.type('header_extension')
export class HeaderExtension extends Struct {
    @Struct.field('uint16') type!: UInt16
    @Struct.field('bytes') data!: Bytes
}

@Struct.type('get_block_response')
export class GetBlockResponse extends Struct {
    @Struct.field('time_point') timestamp!: TimePoint
    @Struct.field('name') producer!: Name
    @Struct.field('uint16') confirmed!: UInt16
    @Struct.field('checksum256') previous!: Checksum256
    @Struct.field('checksum256') transaction_mroot!: Checksum256
    @Struct.field('checksum256') action_mroot!: Checksum256
    @Struct.field('uint32') schedule_version!: UInt32
    @Struct.field(NewProducers, {optional: true}) new_producers?: NewProducers
    @Struct.field('header_extension', {optional: true}) header_extensions?: HeaderExtension[]
    @Struct.field('any', {optional: true}) new_protocol_features?: any
    @Struct.field('signature') producer_signature!: Signature
    @Struct.field(TransactionReceipt, {array: true}) transactions!: TransactionReceipt[]
    @Struct.field('block_extension', {optional: true}) block_extensions!: BlockExtension[]
    @Struct.field('checksum256') id!: Checksum256
    @Struct.field('uint32') block_num!: UInt32
    @Struct.field('uint32') ref_block_prefix!: UInt32
}

@Struct.type('active_schedule_producer_authority')
export class ActiveScheduleProducerAuthority extends Struct {
    @Struct.field('name') producer_name!: Name
    @Struct.field('any') authority!: any
}

@Struct.type('active_schedule_producer')
export class ActiveScheduleProducer extends Struct {
    @Struct.field('name') producer_name!: Name
    @Struct.field(ActiveScheduleProducerAuthority) authority!: ActiveScheduleProducerAuthority
}

@Struct.type('active_schedule')
export class ActiveSchedule extends Struct {
    @Struct.field('uint32') version!: UInt32
    @Struct.field(ActiveScheduleProducer, {array: true}) producers!: ActiveScheduleProducer[]
}

@Struct.type('block_state_header')
export class BlockStateHeader extends Struct {
    @Struct.field('time_point') timestamp!: TimePoint
    @Struct.field('name') producer!: Name
    @Struct.field('uint16') confirmed!: UInt16
    @Struct.field('checksum256') previous!: Checksum256
    @Struct.field('checksum256') transaction_mroot!: Checksum256
    @Struct.field('checksum256') action_mroot!: Checksum256
    @Struct.field('uint32') schedule_version!: UInt32
    @Struct.field(HeaderExtension, {array: true, optional: true})
    header_extensions?: HeaderExtension[]
    @Struct.field('signature') producer_signature!: Signature
}

@Struct.type('get_block_header_state_response')
export class GetBlockHeaderStateResponse extends Struct {
    @Struct.field('uint32') block_num!: UInt32
    @Struct.field('uint32') dpos_proposed_irreversible_blocknum!: UInt32
    @Struct.field('uint32') dpos_irreversible_blocknum!: UInt32
    @Struct.field('checksum256') id!: Checksum256
    @Struct.field(BlockStateHeader) header!: BlockStateHeader
    /** Unstructured any fields specific to header state calls */
    @Struct.field('any') active_schedule!: any
    @Struct.field('any') blockroot_merkle!: any
    @Struct.field('any') producer_to_last_produced!: any
    @Struct.field('any') producer_to_last_implied_irb!: any
    @Struct.field('any') valid_block_signing_authority!: any
    @Struct.field('any') confirm_count!: any
    @Struct.field('any') pending_schedule!: any
    @Struct.field('any') activated_protocol_features!: any
    @Struct.field('any') additional_signatures!: any
}

@Struct.type('get_info_response')
export class GetInfoResponse extends Struct {
    /** Hash representing the last commit in the tagged release. */
    @Struct.field('string') server_version!: string
    /** Hash representing the ID of the chain. */
    @Struct.field('checksum256') chain_id!: Checksum256
    /** Highest block number on the chain */
    @Struct.field('uint32') head_block_num!: UInt32
    /** Highest block number on the chain that has been irreversibly applied to state. */
    @Struct.field('uint32') last_irreversible_block_num!: UInt32
    /** Highest block ID on the chain that has been irreversibly applied to state. */
    @Struct.field('checksum256') last_irreversible_block_id!: Checksum256
    /** Highest block ID on the chain. */
    @Struct.field('checksum256') head_block_id!: Checksum256
    /** Highest block unix timestamp. */
    @Struct.field('time_point') head_block_time!: TimePoint
    /** Producer that signed the highest block (head block). */
    @Struct.field('name') head_block_producer!: Name
    /** CPU limit calculated after each block is produced, approximately 1000 times `blockCpuLimit`. */
    @Struct.field('uint64') virtual_block_cpu_limit!: UInt64
    /** NET limit calculated after each block is produced, approximately 1000 times `blockNetLimit`. */
    @Struct.field('uint64') virtual_block_net_limit!: UInt64
    /** Actual maximum CPU limit. */
    @Struct.field('uint64') block_cpu_limit!: UInt64
    /** Actual maximum NET limit. */
    @Struct.field('uint64') block_net_limit!: UInt64
    /** String representation of server version. */
    @Struct.field('string?') server_version_string?: string
    /** Sequential block number representing the best known head in the fork database tree. */
    @Struct.field('uint32?') fork_db_head_block_num?: UInt32
    /** Hash representing the best known head in the fork database tree. */
    @Struct.field('checksum256?') fork_db_head_block_id?: Checksum256

    getTransactionHeader(secondsAhead = 120): TransactionHeader {
        const expiration = TimePointSec.fromMilliseconds(
            this.head_block_time.toMilliseconds() + secondsAhead * 1000
        )
        const id = this.last_irreversible_block_id
        const prefixArray = id.array.subarray(8, 12)
        const prefix = new Uint32Array(prefixArray.buffer, prefixArray.byteOffset, 1)[0]
        return TransactionHeader.from({
            expiration,
            ref_block_num: this.last_irreversible_block_num.value & 0xffff,
            ref_block_prefix: prefix,
        })
    }
}

export interface PushTransactionResponse {
    transaction_id: string
    processed: {
        id: string
        block_num: number
        block_time: string
        receipt: {status: string; cpu_usage_us: number; net_usage_words: number}
        elapsed: number
        net_usage: number
        scheduled: boolean
        action_traces: any[]
        account_ram_delta: any
    }
}

export interface TableIndexTypes {
    float128: Float128
    float64: Float64
    i128: Int128
    i64: Int64
    name: Name
    ripemd160: Checksum160
    sha256: Checksum256
}

export type TableIndexType = Name | Int64 | Int128 | Float64 | Checksum256 | Checksum160

export interface GetTableRowsParams<Index = TableIndexType | string> {
    /** The name of the smart contract that controls the provided table. */
    code: NameType
    /** Name of the table to query. */
    table: NameType
    /** The account to which this data belongs, if omitted will be set to be same as `code`. */
    scope?: string
    /** Lower lookup bound. */
    lower_bound?: Index
    /** Upper lookup bound. */
    upper_bound?: Index
    /** How many rows to fetch, defaults to 10 if unset. */
    limit?: UInt32Type
    /** Whether to iterate records in reverse order. */
    reverse?: boolean
    /** Position of the index used, defaults to primary. */
    index_position?:
        | 'primary'
        | 'secondary'
        | 'tertiary'
        | 'fourth'
        | 'fifth'
        | 'sixth'
        | 'seventh'
        | 'eighth'
        | 'ninth'
        | 'tenth'
    /**
     * Whether node should try to decode row data using code abi.
     * Determined automatically based the `type` param if omitted.
     */
    json?: boolean
}

export interface GetTableRowsParamsKeyed<Index = TableIndexType, Key = keyof TableIndexTypes>
    extends GetTableRowsParams<Index> {
    /** Index key type, determined automatically when passing a typed `upper_bound` or `lower_bound`. */
    key_type: Key
}

export interface GetTableRowsParamsTyped<Index = TableIndexType | string, Row = ABISerializableType>
    extends GetTableRowsParams<Index> {
    /** Result type for each row. */
    type: Row
}

export interface GetTableRowsResponse<Index = TableIndexType, Row = any> {
    rows: Row[]
    more: boolean
    next_key?: Index
}
