import {copyArray, copyObject, isString} from "../source/utils/utils";

describe('utils', function() {
    describe('isArray', function () {
        it('should correctly distinguish array from not array', function () {
            expect(Array.isArray([])).toBeTruthy();
            expect(Array.isArray([1, 2])).toBeTruthy();
            expect(Array.isArray(['a', 'b'])).toBeTruthy();
            expect(Array.isArray([{hello: 'hello'}])).toBeTruthy();
            expect(Array.isArray([[[]]])).toBeTruthy();
            expect(Array.isArray([[], []])).toBeTruthy();
            expect(Array.isArray(1)).toBeFalsy();
            expect(Array.isArray('abc')).toBeFalsy();
            expect(Array.isArray({})).toBeFalsy();
            expect(Array.isArray(null)).toBeFalsy();
            expect(Array.isArray(undefined)).toBeFalsy();
            expect(Array.isArray(NaN)).toBeFalsy();
        });
    });

    describe('isString', function () {
        it('should correctly distinguish string from not string', function () {
            expect(isString('hello')).toBeTruthy();
            expect(isString('')).toBeTruthy();
            expect(isString('123')).toBeTruthy();
            expect(isString(123)).toBeFalsy();
            expect(isString([])).toBeFalsy();
            expect(isString(['absc'])).toBeFalsy();
            expect(isString({})).toBeFalsy();
            expect(isString(null)).toBeFalsy();
            expect(isString(undefined)).toBeFalsy();
        });
    });

    describe('.copyObject()', function () {
        it('should copy all keys of the object and their values', function () {
            var obj = {a: undefined, b: null, c: 1, d: 'a', e: [1, 2], f: {a: 1, b: {c: 1, d: 2}}};
            var copy = copyObject(obj);
            expect(obj).toEqual(copy);
            expect(copy).not.toBe(obj);
        });

        it('should copy Functions as Functions', function () {
            var obj = {
                a: function () {
                }
            };
            var copy = copyObject(obj);
            expect(copy.a).toBe(obj.a);
        });
    });

    describe('.copyArray()', () => {
        it('should return a deep copy of array', () => {
            let array = [[[0, 1, false, 'abc'], [{}, []], ['as', 3]]];
            let copy = copyArray(array);
            expect(copy).toEqual(array);
            expect(copy[0]).not.toBe(array[0]);
            expect(copy[0][0]).not.toBe(array[0][0]);
            expect(copy[0][1]).not.toBe(array[0][1]);
            expect(copy[0][1][0]).toBe(array[0][1][0]);
        });
    });
});
