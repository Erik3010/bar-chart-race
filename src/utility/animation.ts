interface AnimationOptions<T> {
  initialValues: T;
  targetValues: T;
  duration?: number;
  onUpdate: (value: T) => void;
}

/**
 * Linearly interpolates between two numbers
 *
 * @param from start value
 * @param to end value
 * @param t interpolation factor in the range [0, 1]
 * @returns number
 */
export const lerp = (from: number, to: number, t: number) =>
  from + (to - from) * t;

/**
 * Computes a smooth interpolation value based on the input parameter t
 * This function uses the polynomial 6t^5 - 15t^4 + 10t^3 to produce a smooth curve.
 *
 * @param t - A value in the range [0, 1] representing the interpolation factor.
 * @returns A value in the range [0, 1] representing the interpolated result.
 */
export const smootherStep = (t: number) =>
  Math.pow(t, 3) * (t * (t * 6 - 15) + 10);

/**
 * Animates a set of values from an initial state to a target state over a specified duration
 *
 * @param options - The options for the animation
 * @returns A promise that resolves when the animation is complete
 */
export const animate = <T extends Record<string, number>>({
  initialValues,
  targetValues,
  duration = 100,
  onUpdate,
}: AnimationOptions<T>) => {
  return new Promise((resolve) => {
    const startTime = performance.now();

    const animate = () => {
      const currentTime = performance.now();
      const elapsedTime = currentTime - startTime;
      const interpolation = elapsedTime / duration;

      if (interpolation >= 1) {
        return resolve(targetValues);
      }

      const fraction = smootherStep(interpolation);

      const newValues = {} as T;
      for (const key in initialValues) {
        const newValue = lerp(initialValues[key], targetValues[key], fraction);
        newValues[key] = newValue as T[typeof key];
      }

      onUpdate(newValues);
      requestAnimationFrame(animate);
    };
    animate();
  });
};
