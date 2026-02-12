/**
 * Wrapper to call Postgres RPC functions - now stubbed with console.log
 */
export async function callRpc<Args = Record<string, unknown>, Result = unknown>(
  functionName: string,
  args?: Args
): Promise<{ data: Result | null; error: any }> {
  console.log('API Call: RPC', { function: functionName, args });
  console.log('API Call Complete: RPC', { function: functionName, result: null });
  return { data: null, error: null };
}
