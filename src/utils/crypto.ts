import JSEncrypt from 'jsencrypt'

// RSA公钥（用于前端加密）
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1neKNqViEQ+ir9zN/SG3
LkS74nkXN86zZZOj742ocecVFsNRQpBuCw0KHcW2fO70c+fTs20JFB1e8xyJBAK0
DQeHkVKpnvFJa3t2dO3hli+1v2B0YPinxebgQzpvdkNK/hInynI1A6hCl52B2gLQ
y3SpO4hD6Dps4FRpXfhxNnU2ng7D+WluVEW5kwKGg/qGxvjvknSxXELY4ONlolLC
MQXXU2W/fOuKFnp5VdJUxK1kkYyOTE4FIGmWyT1wf0XA3l3RoAYTQA3zM3i59d4G
yp852iyH+MoOZtLGlO9iRjSMj1au2STUosx04P/dyPGQ25jGyQsW8KcsVj4SO1hm
JwIDAQAB
-----END PUBLIC KEY-----`

/**
 * RSA加密
 * @param text 要加密的文本
 * @returns 加密后的Base64字符串
 */
export function encrypt(text: string): string {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(PUBLIC_KEY)
  const encrypted = encryptor.encrypt(text)
  return encrypted || text
}

/**
 * RSA解密（前端一般不需要解密，私钥保存在后端）
 * @param encryptedText 加密后的文本
 * @returns 解密后的字符串
 */
export function decrypt(encryptedText: string): string {
  // 前端不解密，私钥保存在后端
  return encryptedText
}
