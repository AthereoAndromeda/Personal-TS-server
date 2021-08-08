declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace jest {
        interface Matchers<R extends void | Promise<void>> {
            /** Same as `toEqual()`, but allows null values*/
            toEqualNullable<E = unknown>(a: E): R;
        }
    }
}

const okObject = {
    message: () => "Ok",
    pass: true,
};

expect.extend({
    toEqualNullable(received, expected) {
        if (received === null) {
            return okObject;
        } else if (this.equals(received, expected)) {
            return okObject;
        } else {
            return {
                message: () => `expected ${received} to be ${expected}`,
                pass: false,
            };
        }
    },
});

export {};
