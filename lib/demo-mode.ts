/** デモ提供用: モックデータ表示かつパスワード不要 */
export function isDemoMode(): boolean {
  return process.env.USE_MOCK_DATA === "true"
}
