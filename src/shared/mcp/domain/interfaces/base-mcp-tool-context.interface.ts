/**
 * Base per-request context handed to every MCP tool.
 *
 * This is intentionally a minimal marker — consuming apps extend it with
 * whatever they resolve from the incoming request (e.g. `{ userId, spaceId }`
 * once a service has authentication/tenancy). Built by the app's own
 * `McpController` override or by wiring auth into `McpServerFactory.create()`.
 */
export interface IBaseMcpToolContext {
  [key: string]: unknown;
}
