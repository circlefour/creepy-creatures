export const serialWriter = () => {
  const filter = {
    usbVendorId: 0x2341 // Arduino SA
  };

  let port = null;
  let writer = null;
  let reader = null;
  let encoder = null;
  let decoder = null;

  const connectPort = async () => {
    try {
      port = await navigator.serial.requestPort({filters: [filter]});
      await port.open({baudRate: 115200});
      return true;
    } catch(error) {
      console.error(error);
      port = null;
      return false;
    }
  };

  function connectWriter() {
    try {
      writer = port.writable.getWriter();
      encoder = new TextEncoder();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  function connectReader() {
    try {
      reader = port.readable.getReader();
      decoder = new TextDecoder();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  return {
    async connect() {
      if (!port) {
        if (!await connectPort()) return false;
        if (!connectWriter()) {
          await this.disconnect();
          return false;
        }
        if (!connectReader()) {
          await this.disconnect();
          return false;
        }
        return true;
      }
    },
    async disconnect() {
      if (reader) {
        reader.releaseLock();
        reader = null;
      }
      if (writer) {
        writer.releaseLock();
        writer = null;
      }
      if (port) {
        await port.close();
        port = null;
      }
    },
    async serialWrite(data) {
      try {
        const encodedData = encoder.encode(data);
        await writer.write(encodedData);
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    async startReading(onData) {
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const text = decoder.decode(value);
          onData(text);
        }
      } catch (error) {
          console.error(error);
      }
    }
  }
};
