declare namespace minimatch {
  interface MinimatchOptions {
    debug?: boolean;
    nobrace?: boolean;
    noglobstar?: boolean;
    dot?: boolean;
    noext?: boolean;
    nocase?: boolean;
    matchBase?: boolean;
    nocomment?: boolean;
    nonegate?: boolean;
    flipNegate?: boolean;
    partial?: boolean;
    allowWindowsEscape?: boolean;
  }

  type IOptions = MinimatchOptions;

  function minimatch(path: string, pattern: string, options?: IOptions): boolean;

  namespace minimatch {
    function filter(pattern: string, options?: IOptions): (path: string, index: number, list: string[]) => boolean;
    function match(list: ReadonlyArray<string>, pattern: string, options?: IOptions): string[];
    function makeRe(pattern: string, options?: IOptions): RegExp | null;
    const Minimatch: MinimatchConstructor;
  }

  interface MinimatchConstructor {
    new (pattern: string, options?: IOptions): Minimatch;
    (pattern: string, options?: IOptions): Minimatch;
    prototype: Minimatch;
  }

  class Minimatch {
    constructor(pattern: string, options?: IOptions);
    pattern: string;
    options: IOptions;
    set: string[][];
    regexp: RegExp | null;
    negate: boolean;
    comment: boolean;
    empty: boolean;
    makeRe(): RegExp | null;
    match(fname: string): boolean;
    parseNegate(): void;
    make(): void;
  }
}

export = minimatch;
