import { Compressor } from "@parcel/plugin";
import { Readable } from "stream";
import getStream from "get-stream";

export default new Compressor({
  async compress({ stream, options }) {
    const result: { stream: Readable; type?: string } = { stream };

    if (options.mode !== "production") {
      const string = await getStream(stream);
      const clipStream = new Readable();
      clipStream.push(string.split("// ==/UserScript==").shift());
      clipStream.push("// ==/UserScript==");
      clipStream.push(null);
      result.stream = clipStream;
      result.type = "dev.js";
    }

    return result;
  },
});
