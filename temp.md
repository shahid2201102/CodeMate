In JavaScript, you can write a function to determine if a number is prime or not.

A **prime number** is a natural number greater than 1 that has no positive divisors other than 1 and itself.

Here's a common and efficient way to implement such a function:

```javascript
/**
 * Checks if a given number is a prime number.
 *
 * @param {number} num The number to check for primality.
 * @returns {boolean} True if the number is prime, false otherwise.
 */
function isPrime(num) {
  // 1. Handle edge cases:
  // Numbers less than or equal to 1 are not prime.
  if (num <= 1) {
    return false;
  }

  // 2. The number 2 is the only even prime number.
  if (num === 2) {
    return true;
  }

  // 3. All other even numbers greater than 2 are not prime.
  if (num % 2 === 0) {
    return false;
  }

  // 4. For odd numbers, check for divisibility by odd numbers
  // starting from 3 up to the square root of the number.
  // We only need to check up to the square root because if a number `n`
  // has a divisor `d` greater than `sqrt(n)`, then it must also have
  // a divisor `k = n/d` that is less than `sqrt(n)`.
  for (let i = 3; i <= Math.sqrt(num); i += 2) {
    if (num % i === 0) {
      return false; // Found a divisor, so it's not prime
    }
  }

  // If no divisors were found, the number is prime.
  return true;
}

// --- Examples of how to use the function ---

console.log(`Is 0 prime? ${isPrime(0)}`);     // Expected: false
console.log(`Is 1 prime? ${isPrime(1)}`);     // Expected: false
console.log(`Is 2 prime? ${isPrime(2)}`);     // Expected: true
console.log(`Is 3 prime? ${isPrime(3)}`);     // Expected: true
console.log(`Is 4 prime? ${isPrime(4)}`);     // Expected: false
console.log(`Is 5 prime? ${isPrime(5)}`);     // Expected: true
console.log(`Is 7 prime? ${isPrime(7)}`);     // Expected: true
console.log(`Is 10 prime? ${isPrime(10)}`);   // Expected: false
console.log(`Is 11 prime? ${isPrime(11)}`);   // Expected: true
console.log(`Is 29 prime? ${isPrime(29)}`);   // Expected: true
console.log(`Is 97 prime? ${isPrime(97)}`);   // Expected: true
console.log(`Is 99 prime? ${isPrime(99)}`);   // Expected: false (99 is divisible by 3, 9, 11, 33)
console.log(`Is 100 prime? ${isPrime(100)}`); // Expected: false
console.log(`Is 101 prime? ${isPrime(101)}`); // Expected: true
```

### Explanation of the Logic:

1.  **`num <= 1`**:
    *   Prime numbers are defined as natural numbers *greater than 1*. So, 0, 1, and any negative numbers are immediately `false`.

2.  **`num === 2`**:
    *   The number 2 is the *first* and *only* even prime number. It's an important special case.

3.  **`num % 2 === 0`**:
    *   After handling 2, any other even number (4, 6, 8, etc.) cannot be prime because they are all divisible by 2. This is a quick check to eliminate half of the remaining numbers.

4.  **`for (let i = 3; i <= Math.sqrt(num); i += 2)`**:
    *   **Starting `i` at 3**: We've already checked for 2, so the next potential odd divisor is 3.
    *   **Loop condition `i <= Math.sqrt(num)`**: This is a crucial optimization. If a number `n` has a divisor `x`, then `n/x` is also a divisor. If `x` were greater than `sqrt(n)`, then `n/x` would have to be less than `sqrt(n)`. This means if `n` has any divisors, it must have at least one divisor less than or equal to its square root. So, we only need to check up to `sqrt(num)`.
    *   **Increment `i += 2`**: Since we've already ruled out all even numbers (except 2), we only need to check for odd divisors (3, 5, 7, 9, 11...). Incrementing by 2 allows us to skip all even numbers in our checks, making the loop twice as fast.
    *   **`num % i === 0`**: If `num` is perfectly divisible by `i` (meaning `i` is a factor of `num`), then `num` is not prime, and we can immediately return `false`.

5.  **`return true`**: If the loop completes without finding any divisors, it means the number is only divisible by 1 and itself, so it is prime.