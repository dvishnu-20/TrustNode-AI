import { useEffect, useCallback, useRef } from 'react';
import { wsClient } from './websocket.js';

export function useTelemetry(sessionId) {
  const lastKeyTime = useRef(0);

  const sendEvent = useCallback((eventType, data = {}) => {
    if (!sessionId) return;

    wsClient.sendEvent({
      session_id: sessionId,
      event_type: eventType,
      timestamp: Date.now(),
      ...data
    });
  }, [sessionId]);

  const handleKeyDown = useCallback((e, field) => {
    const now = Date.now();
    const duration = lastKeyTime.current ? now - lastKeyTime.current : null;
    lastKeyTime.current = now;

    // Send every keydown to measure cadence
    sendEvent('keydown', {
      field,
      duration
    });
  }, [sendEvent]);

  const handlePaste = useCallback((e, field) => {
    sendEvent('paste', {
      field,
      value_length: e.clipboardData.getData('text').length
    });
  }, [sendEvent]);

  const handleFocus = useCallback((e, field) => {
    sendEvent('focus', { field });
  }, [sendEvent]);

  const handleSubmit = useCallback((paymentMethod) => {
    sendEvent('submit', { payment_method: paymentMethod });
  }, [sendEvent]);

  const handleCODSelected = useCallback(() => {
    sendEvent('cod_selected');
  }, [sendEvent]);

  return {
    handleKeyDown,
    handlePaste,
    handleFocus,
    handleSubmit,
    handleCODSelected
  };
}
