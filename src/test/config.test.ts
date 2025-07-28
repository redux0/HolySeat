/**
 * 简单的配置测试 - 验证Jest设置是否正确
 */

describe('Jest配置测试', () => {
  test('基本的JavaScript功能', () => {
    expect(1 + 1).toBe(2)
  })
  
  test('字符串操作', () => {
    const text = 'Hello World'
    expect(text.toLowerCase()).toBe('hello world')
  })
})
