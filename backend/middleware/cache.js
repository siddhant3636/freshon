import redis from "../config/redis.js";


const cache = (keyPrefix, expiry = 300) => {

  return async (req, res, next) => {

    const key =keyPrefix +JSON.stringify({query: req.query,params: req.params,body: req.body});
    const cached = await redis.get(key);

    if (cached) {
      res.set("X-Cache", "HIT");
      return res.json(JSON.parse(cached));
    }



    res.sendResponse = res.json;
    res.set("X-Cache", "MISS");
    res.json = async (body) => {
      await redis.set(key, JSON.stringify(body), "EX", expiry);
      res.sendResponse(body);
    };

    next();
  };
};

export default cache;