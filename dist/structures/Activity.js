export var ActivityType;
(function (ActivityType) {
    ActivityType[ActivityType["Playing"] = 0] = "Playing";
    ActivityType[ActivityType["Listening"] = 2] = "Listening";
    ActivityType[ActivityType["Watching"] = 3] = "Watching";
    ActivityType[ActivityType["Competing"] = 5] = "Competing";
})(ActivityType || (ActivityType = {}));
export var StatusDisplayType;
(function (StatusDisplayType) {
    StatusDisplayType[StatusDisplayType["Name"] = 0] = "Name";
    StatusDisplayType[StatusDisplayType["State"] = 1] = "State";
    StatusDisplayType[StatusDisplayType["Details"] = 2] = "Details";
})(StatusDisplayType || (StatusDisplayType = {}));
