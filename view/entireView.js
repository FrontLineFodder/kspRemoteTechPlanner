﻿/// <reference path="../scripts/typings/easeljs/easeljs.d.ts" />
/// <reference path="../scripts/typings/createjs-lib/createjs-lib.d.ts" />
/// <reference path="../scripts/typings/tweenjs/tweenjs.d.ts" />
/// <reference path="../model/body.ts" />
/// <reference path="../model/antenna.ts" />
/// <reference path="../model/satellites.ts" />
/// <reference path="../calculator/point.ts" />
/// <reference path="graphicshelper.ts" />
/// <reference path="view.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var EntireView = (function (_super) {
    __extends(EntireView, _super);
    function EntireView(stage, innerSize, outerSize) {
        _super.call(this, stage, innerSize, outerSize);

        // shape for drawing in inner coordinates
        this.shapeInner = new createjs.Shape();
        this.shapes.addChild(this.shapeInner);

        // name of orbiting body
        this.txtBodyName = new createjs.Text("", View.fontSetBig);
        this.txtBodyName.textAlign = "center";
        this.txtBodyName.textBaseline = "middle";
        this.txtBodyName.x = this.outerCenter.x;
        this.txtBodyName.y = this.outerCenter.y;
        this.texts.addChild(this.txtBodyName);

        // sphere of influence
        this.txtBodySoI = new createjs.Text("", View.fontSetNormal);
        this.txtBodySoI.textAlign = "center";
        this.txtBodySoI.textBaseline = "top";
        this.txtBodySoI.x = this.outerCenter.x;
        this.texts.addChild(this.txtBodySoI);

        // altitude of satellites
        this.txtSatAltitude = new createjs.Text("", View.fontSetNormal);
        this.txtSatAltitude.textAlign = "center";
        this.txtSatAltitude.textBaseline = "top";
        this.txtSatAltitude.x = this.outerCenter.x;
        this.texts.addChild(this.txtSatAltitude);

        // distance between one of satellites and next one
        this.txtCommDistance = new createjs.Text("", View.fontSetNormal);
        this.txtCommDistance.textAlign = "left";
        this.txtCommDistance.textBaseline = "top";
        this.texts.addChild(this.txtCommDistance);

        // distance between one of satellites and the one after the next
        this.txtCommDistance2 = new createjs.Text("", View.fontSetNormal);
        this.txtCommDistance2.textAlign = "right";
        this.txtCommDistance2.textBaseline = "down";
        this.texts.addChild(this.txtCommDistance2);

        // upper limit to obtain stable connection
        this.txtCommStableRange = new createjs.Text("", View.fontSetNormal);
        this.txtCommStableRange.textAlign = "center";
        this.txtCommStableRange.textBaseline = "bottom";
        this.txtCommStableRange.x = this.outerCenter.x;
        this.texts.addChild(this.txtCommStableRange);
    }
    EntireView.prototype.show = function () {
        this.shapeInner.scaleX = this.shapeInner.scaleY = this.outerSize / this.innerSize;

        this.shapeInner.graphics.clear();
        this.shapeInner.graphics.setStrokeStyle(this.toInner(View.strokeLineWidth));

        this.showSatellites(this.shapeInner.graphics, this.satellites, this.satellites.body, this.satellites.antenna);
        this.showBody(this.shapeInner.graphics, this.satellites, this.satellites.body);
    };

    EntireView.prototype.showBody = function (g, s, b) {
        // orbiting body
        g.beginFill(b.color).drawCircle(this.innerCenter.x, this.innerCenter.y, b.radius).endFill();

        // name of orbiting body
        this.txtBodyName.text = b.name;

        // sphere of influence
        if (b.soi != Number.POSITIVE_INFINITY) {
            // limit of SoI
            g.beginStroke("yellow").drawCircle(this.innerCenter.x, this.innerCenter.y, b.soi - b.radius).endStroke();

            // height of SoI
            this.txtBodySoI.text = "Sphere of Influence: " + (b.soi - b.radius).toLocaleString("en", View.localeSetting) + " km";
            this.txtBodySoI.y = this.outerCenter.y + Math.max(this.toOuter(b.soi - b.radius) + View.marginText, this.toOuter(b.radius + s.altitude) + View.marginTextPushed);
        } else {
            this.txtBodySoI.text = "";
        }
    };

    EntireView.prototype.showSatellites = function (g, s, b, a) {
        // orbit
        g.beginStroke("black").drawCircle(this.innerCenter.x, this.innerCenter.y, s.altitude + b.radius).endStroke();

        this.txtSatAltitude.text = "Altitude: " + s.altitude.toLocaleString("en", View.localeSetting) + " km";
        this.txtSatAltitude.y = this.outerCenter.y + this.toOuter(s.altitude + b.radius) + View.marginText;

        for (var i = 0; i < s.count; i++) {
            g.beginFill("black").drawCircle(this.innerCenter.x + s.satPosition(i).x, this.innerCenter.y + s.satPosition(i).y, this.toInner(View.dotRadius)).endFill();
        }

        for (var i = 0; i < s.count; i++) {
            g.beginFill("rgba(255,0,0,0.1)").drawCircle(this.innerCenter.x + s.satPosition(i).x, this.innerCenter.y + s.satPosition(i).y, a.range).endFill();
        }

        // distance
        g.beginStroke(s.isNextSatConnectable() ? "blue" : "red");
        GraphicsHelper.drawDualArrow(this.shapeInner.graphics, this.innerCenter.x + s.satPosition(0).x, this.innerCenter.y + s.satPosition(0).y, this.innerCenter.x + s.satPosition(1).x, this.innerCenter.y + s.satPosition(1).y, this.toInner(View.arrowSize)).endStroke();

        this.txtCommDistance.text = "Distance: " + s.satDistance().toLocaleString("en", View.localeSetting) + " km";
        this.txtCommDistance.x = this.outerCenter.x + this.toOuter((s.satPosition(0).x + s.satPosition(1).x) / 2) + View.marginText / 2;
        this.txtCommDistance.y = this.outerCenter.y + this.toOuter((s.satPosition(0).y + s.satPosition(1).y) / 2) + View.marginText / 2;

        if (s.count > 4) {
            g.beginStroke(s.canConnectToSat(2) ? "blue" : "red");
            GraphicsHelper.drawDualArrow(this.shapeInner.graphics, this.innerCenter.x + s.satPosition(0).x, this.innerCenter.y + s.satPosition(0).y, this.innerCenter.x + s.satPosition(2).x, this.innerCenter.y + s.satPosition(2).y, this.toInner(View.arrowSize)).endStroke();

            this.txtCommDistance2.text = "Distance: " + s.satDistanceTo(2).toLocaleString("en", View.localeSetting) + " km";
            this.txtCommDistance2.x = this.outerCenter.x + this.toOuter((s.satPosition(0).x + s.satPosition(2).x) / 2) - View.marginText / 2;
            this.txtCommDistance2.y = this.outerCenter.y + this.toOuter((s.satPosition(0).y + s.satPosition(2).y) / 2) - View.marginText / 2;
        }

        // stable area
        if (s.hasStableArea()) {
            // upper limit of stable area
            this.shapeInner.graphics.beginStroke("green").drawCircle(this.innerCenter.x, this.innerCenter.y, s.stableLimitAltitude() + b.radius).endStroke();

            // range of stable area
            this.txtCommStableRange.text = "Stable: " + s.stableLimitAltitude().toLocaleString("en", View.localeSetting) + " km";
            this.txtCommStableRange.y = this.outerCenter.y - this.toOuter(s.stableLimitAltitude() + b.radius) - View.marginText;
        } else {
            this.txtCommStableRange.text = "";
        }
    };
    return EntireView;
})(View);
//# sourceMappingURL=entireView.js.map
