interface ConfettiOptions {
    particleCount?: number;
    spread?: number;
    origin?: {
        x: number;
        y: number;
    };
    colors?: string[];
}
export declare const useConfetti: () => {
    fire: (options?: ConfettiOptions) => void;
    fireworks: () => void;
    burst: (element?: HTMLElement) => void;
};
export {};
//# sourceMappingURL=useConfetti.d.ts.map