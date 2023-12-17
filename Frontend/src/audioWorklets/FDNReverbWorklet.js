/*
    
    Sample rate is 48 kHz. 500 ms of samples is 24 khz

    Number of samples per unit of time is :
        (ms / 1000) * sample rate

    Input[channelNum] is a float32Array of 128 samples.
    values are between 0 and 1.

    ----------------------- Delay -----------------------------

    https://github.com/Signalsmith-Audio/reverb-example-code

    The length of the delay array needs to be determined by
    the desired delay length. Length will be (ms / 1000) * sample rate.
    Have a read head and a write head. The read head will return 
    the sample at that point, and the write head will write a sample
    at a different point. Have the read head start at index 1, and write
    head start at index 0. Heads will loop, and will serve as the delay.

    Essentially, the delay is a wrapper class for a float32Array, which will
    support the following funcitonalities:

        - Read
        - Write

    ---------------- Intermediary idea --------------------------

    Create a series of many delay lines (30 to 70), where each has 
    delay that is staggered (5ms, 8ms, 13ms, etc);

    It was kinda cool, might end up being useful


    ------------------- How to handle many channels -------------

    // main.cpp

    In order to work with many channels, ony needs to duplicate
    the input channel (which is a single stream of samples)
    as many times as neccessary (to work with) virtual channels. 

        input: 
        [1,3,5,7] // left channel
        [2,4,6,8] // right channel

        Duplicate channels:
        [
            1,
            2,
            1,
            2,
            1,
            2,
            1,
        ]

        This means, that 
        for 8 channels, there will be
        8 floats, like the example above.

        After the input samples have been
        duplicated, they are processed
        by the processor.

        Turns out that the reason for handling
        the samples in an interleaved format
        is because wav files store sample
        data in this manner. It sores samples
        in the format: L,R,L,R,L,R,L,R,L,....
        This requires it to be reassembled 
        as such. For my use case, simply 
        duplicate the samples for the left
        and right channels normally. When
        going to recombine the channel data
        from the duplicated channels, average
        the data from the left and right
        duplicated channels respectively, and 
        send them to the output at those channels.

    // reverb-example-code.h

    For each diffusion step, spread the delays
    ms times out accross a range of ms values
    from (0 to maximum).

    Run the samples through each diffuser sequentially.
    diff1 -> diff2 -> diff3 -> diff4 -> .....

    For the diffusion step, the input to each diffuser
    is the 8 channels which duplicate the input signal.
    In my case, it will be 8 channels, 4 that duplicate
    a sample from the left channel, and 4 that duplicate
    a sample from the right channel.

    Within each diffusion step, there is a set of delays
    (1 delay per channel) each with a variable delay time.
    
    For processing, write the input samples into the delay,
    and read the values that are returned from the array.
    The values will be an array of 8 values (which are 
    duplicates of the input, but delayed with various 
    lengths).Use hadamard matrix to mix the data, and
    return the mixed data (array of 8 vals).

    The hadamard in-place diffusion step seems to be 
    convertable directly into javascript

    TODO:
        
        - Make Processor class
            Will take the sample data for each channel,
            and will duplicate it to N channels. This
            duplicated data will be used as the input
            to the diffuser class, and will serve to 
            aggregate the output together.

        - Make diffuser class.
            - Sets up a series of delays for each
            channel. Each delay has a variable time.

            - Process, write to the delay, and read from
            each delay channel line. Mix with hadamard
            matrix. Flip some polarities occasionally,
            and return the mixed channel data.

        - Make hadamard class that will implement the 
        logic found in the example code. There will only
        need to be a singular instance of this class 
        that can be used across all delay lines in the
        diffuser class.

        - Make super class that serves as a wrapper
        for all of the processing taking place (diffuser
        steps)

*/

/*
Serves as a simple delay. Will take in samples at 1 time, and output them at another time
*/

class Delay { // works

    // buffer, delayMs, bufferSize, readHead, writeHead

    constructor(delayMs, sampleRate) {
        this.DelayMs = delayMs;
        this.bufferSize = Math.floor((delayMs / 1000) * sampleRate) + 1;
        this.buffer = new Float32Array(this.bufferSize).fill(0);
        this.writeHead = 0;
        this.readHead = 1;

        // console.log(delayMs);
    }

    write(sample) {
        this.buffer[this.writeHead] = sample;
        this.writeHead++;
        this.writeHead = this.writeHead % this.bufferSize;
    }

    read() {
        let temp = this.buffer[this.readHead];
        this.readHead++;
        this.readHead = this.readHead % this.bufferSize;
        return temp;
    }

}

class Hadamard {
    static recursiveUnscaled(input, size, offset = 0) {
        if (size <= 1) {
            return;
        }

        const halfSize = size / 2;

        Hadamard.recursiveUnscaled(input, halfSize, offset);
        Hadamard.recursiveUnscaled(input, halfSize, offset + halfSize);

        for (let i = 0; i < halfSize; i++) {
            const a = input[offset + i];
            const b = input[offset + i + halfSize];
            input[offset + i] = a + b;
            input[offset + i + halfSize] = a - b;
        }
    }

    static inPlace(input) {
        const size = input.length;
        Hadamard.recursiveUnscaled(input, size);

        const scalingFactor = Math.sqrt(1.0 / size);
        for (let i = 0; i < size; i++) {
            input[i] *= scalingFactor;
        }
    }
}

/*
    Will have a delay of variable length for each channel (within 50ms).
    Will read from the delayed channels, mix the delayed outputs with
    hadamard matrix, and will return the samples.
*/
class Diffuser {

    constructor(channelCount, maxMsDelay) {
        this.channelCount = channelCount;
        this.sampleBuffer = new Float32Array(channelCount).fill(0);
        this.delayedChannels = new Array(channelCount); // Array of delays, 1 for each channel
        this.polarity = new Array(channelCount);
        this.prevTemp = 0;

        console.log("\n");

        for (let i = 0; i < channelCount; i++) {
            // const temp = Math.floor(Math.random() * maxMsDelay); // Distribute delay times out randomly
            // const temp = Math.floor(maxMsDelay / (i + 1)); // Distribute delay times out evenly
            const temp = Diffuser.distribute(i, channelCount, maxMsDelay);
            // console.log("--- " + temp, temp - this.prevTemp);
            // this.prevTemp = temp;
            this.delayedChannels[i] = new Delay(temp, 48000);
            this.polarity[i] = Math.random() > .49999 ? 1 : -1;
        }
    }

    /* 
        input: Float32Array(8)
        input is the sampleBuffer of the processorClass 
        mutated by reference
    */
    process(input) {

        for (let i = 0; i < input.length; i++) {
            this.delayedChannels[i].write(input[i]);
            this.sampleBuffer[i] = this.delayedChannels[i].read();
        }

        // Mix with hadamard matrix
        Hadamard.inPlace(this.sampleBuffer, this.channelCount);

        for (let i = 0; i < input.length; i++) {
            input[i] = this.sampleBuffer[i] * this.polarity[i];
        }

        return; // input is mutated by reference

    }

    static distribute(index, maxChannelCount, maxMsDelay) {
        const dist = -(index - maxChannelCount);
        // exponent determines how tightly values are distributed near 0 ms. 2.0 is too tight, 1.0 is too loose
        return maxMsDelay / Math.pow(dist, 1.1);
    }

}

/*
    Will take in sample input data, duplicate it for N channels,
    process the data, and return the data in 2 channel format.
*/
class Processor {

    constructor(channelCount, diffuserCount, diffusionMs) {

        if (channelCount % 2 != 0) {
            console.error("Cannot create a processor with a channel count that is not a multiple of 2!");
            return;
        }

        this.diffuserCount = diffuserCount;
        this.diffusionMs = diffusionMs;
        this.channelCount = channelCount;
        this.sampleBuffer = new Float32Array(channelCount).fill(0);
        this.tempOutputBuffer = new Float32Array(2).fill(0); // assuming 2 channels for the output
        this.diffusers = new Array(diffuserCount);
        this.errorCount = 0; // Utility attribute used for logging to the console, but not every time the process method is called.
        this.isReady = true; // Utility attribute used instead of an async function to determine the processor is configured correctly.

        for (let i = 0; i < diffuserCount; i++) {
            this.diffusers[i] = new Diffuser(channelCount, diffusionMs);
        }

    }

    /*
        Input : [[Float32Array(128), Float32Array(128)]]
        Output: [[Float32Array(128), Float32Array(128)]]

        will mutate output by reference (no return)
    */

    /*
        To reset diffusers with different MS count. check to 
        see if the parameter input has changed. If so, loop
        through diffuser attribute and initialize new diffusers
        with the appropriate MS count. 

        This may require the wrapping of this reinitialization
        process in an async function that can be awaited.
    */

    process(input, output, parameters) {

        if (!this.isReady) {
            return;
        }

        const wetPercent = parameters.WetPercent[0];
        const dryPercent = 100 - wetPercent;

        if (this.diffusionMs != parameters.MsDelaySize[0] || this.diffuserCount != parameters.DiffuserCount[0]) {

            console.log("Param change!");

            this.isReady = false; // lock the process function until done configuring

            if (this.diffuserCount != parameters.DiffuserCount[0]) {
                this.diffusers = new Array(parameters.DiffuserCount[0]);
            }

            this.diffusionMs = parameters.MsDelaySize[0];
            this.diffuserCount = parameters.DiffuserCount[0];

            for (let i = 0; i < this.diffuserCount; i++) {
                this.diffusers[i] = new Diffuser(this.channelCount, parameters.MsDelaySize[0]);
            }

            this.isReady = true;
        }


        if (input[0].length != output[0].length) {
            if (this.errorCount % 5000 == 0) {
                console.error("Input and output are not of the same channel length!"); // expecting each to be 2 channels
                this.errorCount = 0;
            }
            return;
        }

        if (input[0][0].length != input[0][1].length) {
            if (this.errorCount % 5000 == 0) {
                console.error("left and right channel sample buffers are not of the same length!");
                this.errorCount = 0;
            }
            return;
        }

        let sampleSize = input[0][0].length;

        for (let sampleIdx = 0; sampleIdx < sampleSize; sampleIdx++) { // duplicate, process, merge duplicates, write to output

            for (let channelIdx = 0; channelIdx < this.channelCount - 1; channelIdx += 2) { // duplicate input samples into tempSampleBuffer
                this.sampleBuffer[channelIdx] = input[0][channelIdx % 2][sampleIdx];
                this.sampleBuffer[channelIdx + 1] = input[0][(channelIdx + 1) % 2][sampleIdx];
            }

            // Process with diffusers

            for (let i = 0; i < this.diffuserCount; i++) {
                this.diffusers[i].process(this.sampleBuffer);
            }

            for (let channelIdx = 0; channelIdx < this.channelCount - 1; channelIdx += 2) { // merge duplicated channels into tempOutputBuffer
                this.tempOutputBuffer[channelIdx % 2] += this.sampleBuffer[channelIdx];
                this.tempOutputBuffer[(channelIdx + 1) % 2] += this.sampleBuffer[channelIdx + 1];
            }

            output[0][0][sampleIdx] = (input[0][0][sampleIdx] * (dryPercent / 100)) + ((this.tempOutputBuffer[0] / (this.channelCount / 2)) * (wetPercent / 100));
            output[0][1][sampleIdx] = (input[0][1][sampleIdx] * (dryPercent / 100)) + ((this.tempOutputBuffer[1] / (this.channelCount / 2)) * (wetPercent / 100));
            // output[0][1][sampleIdx] = this.tempOutputBuffer[1] / (this.channelCount / 2);
            this.tempOutputBuffer[0] = 0;
            this.tempOutputBuffer[1] = 0;

        }

        return; // output buffer will be mutated by reference

    }

}

class FDNReverb extends AudioWorkletProcessor {

    constructor() {
        super();
        this.processor = new Processor(8, 10, 500);
    }

    process(inputList, outputList, parameters) {
        this.processor.process(inputList, outputList, parameters);
        return true;
    }

    static get parameterDescriptors() {
        return [
            {
                name: "WetPercent",
                defaultValue: 100,
                minValue: 0,
                maxValue: 100,
            },
            {
                name: "MsDelaySize",
                defaultValue: 25,
                minValue: 5,
                maxValue: 1500,
            },
            {
                name: "DiffuserCount",
                defaultValue: 10,
                minValue: 2,
                maxValue: 25,
            }
        ];
    }

}

registerProcessor("FDNReverb", FDNReverb);