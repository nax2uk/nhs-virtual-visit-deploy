import logger from "../../../logger";
import { CANCELLED } from "../../../src/helpers/visitStatus";

export default ({ getDb }) => async (callId) => {
  logger.info(`deleting visit for callId ${callId}`, callId);

  try {
    const db = await getDb();
    const results = await db.any(
      `UPDATE scheduled_calls_table SET status = $1 WHERE call_id = $2`,
      [CANCELLED, callId]
    );
    logger.info(`${results}, success=true`, results);
    return {
      success: true,
      error: null,
    };
  } catch (error) {
    logger.error(JSON.stringify(error));
    return {
      success: false,
      error: error.toString(),
    };
  }
};
