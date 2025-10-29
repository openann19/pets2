import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { createDeepSeekService } from '../deepSeekService';

describe('DeepSeekService', () => {
  const apiKey = 'test-key';

  beforeEach(() => {
    globalThis.fetch = jest.fn() as never;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('analyzePetPhoto calls API and returns response', async () => {
    const mockResponse = {
      id: 'r1',
      object: 'chat.completion',
      created: Date.now(),
      model: 'deepseek-vision',
      choices: [
        {
          index: 0,
          message: { role: 'assistant', content: '{"species":"dog"}' },
          finish_reason: 'stop',
        },
      ],
      usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
    };

    jest.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const svc = createDeepSeekService({ apiKey });
    const res = await svc.analyzePetPhoto('BASE64');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.deepseek.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: `Bearer ${apiKey}` }),
      }),
    );
    const content = res.choices[0]!.message?.content ?? '';
    expect(content).toContain('species');
  });

  test('analyzePetPhoto throws on API error', async () => {
    jest.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: { message: 'Bad request', type: 'bad', code: '400' } }),
    } as Response);

    const svc = createDeepSeekService({ apiKey });

    await expect(svc.analyzePetPhoto('BASE64')).rejects.toThrow('DeepSeek API Error: Bad request');
  });

  test('testConnection returns boolean based on API result', async () => {
    jest
      .mocked(globalThis.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ choices: [{}, {}] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: { message: 'x', type: 'y', code: 'z' } }),
      } as Response);

    const svc = createDeepSeekService({ apiKey });

    await expect(svc.testConnection()).resolves.toBe(true);
    await expect(svc.testConnection()).resolves.toBe(false);
  });
});
