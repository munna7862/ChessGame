import type { EngineWorkerRequest, EngineWorkerResponse } from "./types";

/**
 * Message handler callback signature for messages received from worker.
 */
export type EngineWorkerMessageHandler = (
  response: EngineWorkerResponse
) => void;

/**
 * Error handler callback signature for uncaught worker errors.
 */
export type EngineWorkerErrorHandler = (error: Error) => void;

/**
 * Abstract bridge interface connecting EngineServiceImpl to an underlying WebWorker
 * or deterministic mock.
 */
export interface EngineWorkerBridge {
  /**
   * Post a typed request message to the engine worker.
   */
  postMessage(request: EngineWorkerRequest): void;

  /**
   * Register a listener for responses sent from the engine worker.
   * Returns an unregister function.
   */
  onMessage(handler: EngineWorkerMessageHandler): () => void;

  /**
   * Register a listener for uncaught worker errors.
   * Returns an unregister function.
   */
  onError(handler: EngineWorkerErrorHandler): () => void;

  /**
   * Terminate the underlying worker and release resources.
   */
  terminate(): void;
}
