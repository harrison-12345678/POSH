// Basic test to verify our setup works
test('Basic test - should pass', () => {
  expect(1 + 1).toBe(2);
});

test('Array should contain item', () => {
  const items = ['auth', 'booking', 'rooms'];
  expect(items).toContain('booking');
});