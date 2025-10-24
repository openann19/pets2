describe("Simple Test", () => {
  it("should pass basic test", () => {
    expect(1 + 1).toBe(2);
  });

  it("should test string operations", () => {
    const greeting = "Hello PawfectMatch";
    expect(greeting).toContain("PawfectMatch");
  });

  it("should test array operations", () => {
    const pets = ["dog", "cat", "bird"];
    expect(pets).toHaveLength(3);
    expect(pets).toContain("dog");
  });
});
