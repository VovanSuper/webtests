// ака, прототинпое мултинаследование
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Creature = (function () {
    function Creature(color) {
        this.color = color;
    }
    return Creature;
})();

var Person = (function (_super) {
    __extends(Person, _super);
    function Person(color, man, age) {
        _super.call(this, color);
        this.man = man;
    }
    return Person;
})(Creature);

var Vovan = (function (_super) {
    __extends(Vovan, _super);
    function Vovan(color, man, age, nic) {
        _super.call(this, color, man, age);
        this.nic = nic;
    }
    return Vovan;
})(Person);
var me = new Vovan("White", {
    name: "Vovan"
}, 30, "VovanSuper");
