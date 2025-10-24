import { parseDeepLink } from '../deepLinking';

describe('Deep Linking Utils', () => {
  describe('parseDeepLink', () => {
    it('should parse subscription success URL correctly', () => {
      const url = 'pawfectmatch://subscription/success?session_id=cs_123456';
      const result = parseDeepLink(url);
      
      expect(result.type).toBe('subscription_success');
      expect(result.params).toEqual({ session_id: 'cs_123456' });
    });
    
    it('should parse subscription cancel URL correctly', () => {
      const url = 'pawfectmatch://subscription/cancel';
      const result = parseDeepLink(url);
      
      expect(result.type).toBe('subscription_cancel');
      expect(result.params).toEqual({});
    });
    
    it('should parse pet profile URL correctly', () => {
      const url = 'pawfectmatch://pet/pet123';
      const result = parseDeepLink(url);
      
      expect(result.type).toBe('pet_profile');
      expect(result.params).toEqual({ petId: 'pet123' });
    });
    
    it('should parse match URL correctly', () => {
      const url = 'pawfectmatch://match/match456';
      const result = parseDeepLink(url);
      
      expect(result.type).toBe('match');
      expect(result.params).toEqual({ matchId: 'match456' });
    });
    
    it('should parse chat URL correctly', () => {
      const url = 'pawfectmatch://chat/match789';
      const result = parseDeepLink(url);
      
      expect(result.type).toBe('chat');
      expect(result.params).toEqual({ matchId: 'match789' });
    });
    
    it('should parse notification URL correctly', () => {
      const url = 'pawfectmatch://notification/notif123/match';
      const result = parseDeepLink(url);
      
      expect(result.type).toBe('notification');
      expect(result.params).toEqual({ 
        notificationId: 'notif123',
        type: 'match' 
      });
    });
    
    it('should return null for unsupported URL schemes', () => {
      const url = 'https://pawfectmatch.com/pet/123';
      const result = parseDeepLink(url);
      
      expect(result.type).toBe(null);
    });
    
    it('should handle malformed URLs gracefully', () => {
      const url = 'invalid-url';
      const result = parseDeepLink(url);
      
      expect(result.type).toBe(null);
    });
  });
});