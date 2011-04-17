﻿function __MakeTypeStub (name) {
    var result = {};
    result.__TypeName__ = name;
    return result;
};

System = __MakeTypeStub("System");
JSIL = __MakeTypeStub("JSIL");

JSIL.Variable = function (value) {
    this.value = value;
};

JSIL.CloneObject = function (obj) {
    function ClonedObject() { }
    ClonedObject.prototype = obj;
    return new ClonedObject();
};

System.Object = function () {};
System.Object.prototype = JSIL.CloneObject(Object.prototype);
System.Object.prototype.__TypeName__ = "System.Object";
System.Object.prototype.toString = function ToString () {
    return this.__TypeName__;
};

JSIL.Array = {};
JSIL.Array.New = function (type, sizeOrInitializer) {
    var size = Number(sizeOrInitializer);
    if (isNaN(size)) {
        // If non-numeric, assume array initializer
        var result = new Array(sizeOrInitializer.length);
        for (var i = 0; i < sizeOrInitializer.length; i++)
            result[i] = sizeOrInitializer[i];
    } else {
        var result = new Array(size);
    }

    /* Even worse, doing this deoptimizes all uses of the array in TraceMonkey. AUGH
      // Can't do this the right way, because .prototype for arrays in JS is insanely busted
      result.__TypeName__ = type.__TypeName__ + "[]";
      result.toString = System.Object.prototype.toString;
    */

    return result;
};

JSIL.Cast = function (value, expectedType) {
    return value;
};

JSIL.Dynamic = {};
JSIL.Dynamic.Cast = function (value, expectedType) {
    return value;
};

JSIL.Delegate = {};
JSIL.Delegate.Prototype = JSIL.CloneObject(
    (function () { }).prototype
);
JSIL.Delegate.Prototype.toString = function () {
    return this.__TypeName__;
}
JSIL.Delegate.New = function (typeName, object, method) {
    var result = function () {
        method.apply(object, arguments);
    };

    result.prototype = JSIL.Delegate.Prototype;
    result.__TypeName__ = typeName;

    return result;
}

System.Exception = function (message) {
    this.__ctor(message);
};
System.Exception.prototype = JSIL.CloneObject(Error.prototype);
System.Exception.prototype.__TypeName__ = "System.Exception";
System.Exception.prototype.__ctor = function (message) {
    this.Message = message;
}
System.Exception.prototype.toString = function () {
    if (typeof (this.Message) == "undefined")
        return System.String.Format("{0}: Exception of type '{0}' was thrown.", this.__TypeName__);
    else
        return System.String.Format("{0}: {1}", this.__TypeName__, this.Message);
};

System.Console = {};
System.Console.WriteLine = function () {
    print(System.String.Format.apply(null, arguments));
};

String.prototype.Split = function (separators) {
    if (separators.length > 1)
        throw new Error("Split cannot handle more than one separator");

    return this.split(separators[0]);
};

System.String = __MakeTypeStub("System.String");
System.String.Format = function (format) {
    format = String(format);

    var regex = new RegExp("{([0-9]*)(?::([^}]*))?}", "g");
    var match = null;

    var args = arguments;
    var matcher = function (match, index, valueFormat, offset, str) {
        index = parseInt(index);

        var value = args[index + 1];

        if (valueFormat) {
            switch (valueFormat[0]) {
                case 'f':
                case 'F':
                    var digits = parseInt(valueFormat.substr(1));
                    return parseFloat(value).toFixed(digits);
                default:
                    throw new Error("Unsupported format string: " + valueFormat);
            }
        } else {
            return String(value);
        }
    };

    return format.replace(regex, matcher);
};

System.Math = {};
System.Math.Max = Math.max;
System.Math.Sqrt = Math.sqrt;

System.Char = __MakeTypeStub("System.Char");

System.Int32 = __MakeTypeStub("System.Int32");
System.Int32.Parse = function (text) {
    return parseInt(text, 10);
};