import redis from "../config/redis.js";

const WINDOW_SIZE = 15 * 60; // 15 minutes
const MAX_REQUESTS = 100;

const redisRateLimiter = async (req, res, next) => {
  try {

    const ip = req.ip;
    const key = `rate:${ip}`;

    const requests = await redis.incr(key);
  
    if (requests === 1) {
      await redis.expire(key, WINDOW_SIZE);
    }

    if (requests > MAX_REQUESTS) {
      return res.status(429).json({
        success: false,
        message: "Too many requests, please try again later."
      });
    }

    next();

  } catch (error) {
    next(error);
  }
};

export default redisRateLimiter;