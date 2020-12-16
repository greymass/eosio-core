import BN from 'bn.js'

import {ABIDecoder} from '../serializer/decoder'
import {ABIEncoder} from '../serializer/encoder'
import {ABISerializableObject} from '../serializer/serializable'
import {isInstanceOf} from '../utils'

import {AnyInt, Int64, Int64Type, UInt32, UInt32Type} from './integer'

export type TimePointType = TimePoint | TimePointSec | string | Date | AnyInt

interface TimePointConstructor {
    from(value: TimePointType): TimePointBase
    fromInteger(value: AnyInt): TimePointBase
    fromDate(value: Date): TimePointBase
    fromString(value: string): TimePointBase
    fromMilliseconds(value: number): TimePointBase
    new (...args: any[]): TimePointBase
}

class TimePointBase implements ABISerializableObject {
    static from<T extends TimePointConstructor>(this: T, value: TimePointType): InstanceType<T> {
        if (isInstanceOf(value, this as TimePointConstructor)) {
            return value as InstanceType<T>
        }
        if (isInstanceOf(value, TimePointBase)) {
            // converting between types
            return this.fromMilliseconds(value.toMilliseconds()) as InstanceType<T>
        }
        if (isInstanceOf(value, Date)) {
            return this.fromDate(value) as InstanceType<T>
        }
        if (typeof value === 'string') {
            return this.fromString(value) as InstanceType<T>
        }

        return this.fromInteger(value) as InstanceType<T>
    }

    static fromString<T extends TimePointConstructor>(this: T, string: string): InstanceType<T> {
        let interpreted = string
        if (!interpreted.includes('+')) {
            interpreted += 'Z'
        }
        const value = Date.parse(interpreted)
        if (!Number.isFinite(value)) {
            throw new Error('Invalid date string')
        }
        return this.fromMilliseconds(value) as InstanceType<T>
    }

    static fromDate<T extends TimePointConstructor>(this: T, date: Date): InstanceType<T> {
        return this.fromMilliseconds(date.getTime()) as InstanceType<T>
    }

    toABI(encoder: ABIEncoder) {
        const self = this as any
        self.value.toABI(encoder)
    }

    equals(other: TimePointType) {
        const self = this.constructor as TimePointConstructor
        return this.toMilliseconds() === self.from(other).toMilliseconds()
    }

    toMilliseconds(): number {
        throw new Error('Not implemented')
    }

    toDate() {
        return new Date(this.toMilliseconds())
    }

    toJSON() {
        return this.toString()
    }

    value: any
    constructor(value: any) {
        this.value = value
    }
}

/** Timestamp with microsecond accuracy. */
export class TimePoint extends TimePointBase {
    static abiName = 'time_point'

    static fromMilliseconds(ms: number) {
        return new TimePoint(Int64.from(Math.round(ms * 1000)))
    }

    static fromInteger(value: Int64Type) {
        return new TimePoint(Int64.from(value))
    }

    static fromABI(decoder: ABIDecoder) {
        return new this(Int64.fromABI(decoder))
    }

    value!: Int64

    toString() {
        return this.toDate().toISOString().slice(0, -1)
    }

    toMilliseconds() {
        return this.value.value.divRound(new BN(1000)).toNumber()
    }
}

/** Timestamp with second accuracy. */
export class TimePointSec extends TimePointBase {
    static abiName = 'time_point_sec'

    static fromMilliseconds(ms: number) {
        return new TimePointSec(UInt32.from(Math.round(ms / 1000)))
    }

    static fromInteger(value: UInt32Type) {
        return new TimePointSec(UInt32.from(value))
    }

    static fromABI(decoder: ABIDecoder) {
        return new this(UInt32.fromABI(decoder))
    }

    value!: UInt32

    toString() {
        return this.toDate().toISOString().slice(0, -5)
    }

    toMilliseconds() {
        return this.value.value * 1000
    }
}

export class BlockTimestamp extends TimePointBase {
    static abiName = 'block_timestamp_type'

    static fromMilliseconds(ms: number) {
        return new TimePointSec(UInt32.from(Math.round((ms - 946684800000) / 500)))
    }

    static fromInteger(value: UInt32Type) {
        return new TimePointSec(UInt32.from(value))
    }

    static fromABI(decoder: ABIDecoder) {
        return new this(UInt32.fromABI(decoder))
    }

    value!: UInt32

    toString() {
        return this.toDate().toISOString().slice(0, -1)
    }

    toMilliseconds() {
        return this.value.value * 500 + 946684800000
    }
}
