// 클래스에서 메서드가 아닌 속성만 추출
export type ExcludeMethod<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any ? never : K]: T[K];
};
