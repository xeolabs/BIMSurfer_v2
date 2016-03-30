define(["bimsurfer/lib/StringView.js"], function(StringView) {
    
    function DataInputStreamReader(arrayBuffer) {
        
        this.arrayBuffer = arrayBuffer;
        this.dataView = new DataView(this.arrayBuffer);
        this.pos = 0;
    
        this.readUTF8 = function() {
            var length = this.dataView.getInt16(this.pos);
            this.pos += 2;
            var view = this.arrayBuffer.slice(this.pos, this.pos + length);
            var result = new StringView(view).toString();
            this.pos += length;
            return result;
        };

        this.align4 = function() {
            // Skips to the next alignment of 4 (source should have done the same!)
            var skip = 4 - (this.pos % 4);
            if(skip > 0 && skip != 4) {
    //			console.log("Skip", skip);
                this.pos += skip;
            }
        };

        this.readFloat = function() {
            var value = this.dataView.getFloat32(this.pos, true);
            this.pos += 4;
            return value;
        };

        this.readInt = function() {
            var value = this.dataView.getInt32(this.pos, true);
            this.pos += 4;
            return value;
        };

        this.readByte = function() {
            var value = this.dataView.getInt8(this.pos);
            this.pos += 1;
            return value;
        };

        this.readLong = function() {
            // We are throwing away the last 4 bytes here...
            var value = this.dataView.getInt32(this.pos, true);
            this.pos += 8;
            return value;
        };

        this.readFloatArray2 = function(length) {
            var results = [];
            for (var i=0; i<length; i++) {
                var value = this.dataView.getFloat32(this.pos, true);
                this.pos += 4;
                results.push(value);
            }
            return results;
        };
        
        this.readFloatArray = function(length) {
            var result = new Float32Array(this.arrayBuffer, this.pos, length);
            this.pos += length * 4;
            return result;
        };

        this.readIntArray2 = function(length) {
            var results = [];
            for (var i=0; i<length; i++) {
                var value = this.dataView.getInt32(this.pos, true);
                this.pos += 4;
                results.push(value);
            }
            return results;
        };
        
        this.readIntArray = function(length) {
            var result = new Int32Array(this.arrayBuffer, this.pos, length);
            this.pos += length * 4;
            return result;
        };
    }
    
    return DataInputStreamReader;
    
});
