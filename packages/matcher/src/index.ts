import { assert } from 'assert-ts';

type Matching<T, K extends keyof T, V> = T extends Record<K, V> ? T : never

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const match = <T extends Record<string, any>>(tag: keyof T) => (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <U extends { [V in Extract<T[typeof tag], keyof U>]: (input: Matching<T, typeof tag, V>) => any }>(transforms: U) => (
        <S extends T>(source: S): ReturnType<U[S[typeof tag]]> => {
            let transform = transforms[source[tag]];

            assert(!!transform, `no case for ${tag}`);
            
            return transform(source);
        }
    )
)