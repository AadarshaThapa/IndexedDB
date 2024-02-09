angular.module('crudApp', [])
    .controller('MainController', ['$scope', function ($scope) {
        var vm = this;

        var db;

        var request = indexedDB.open('crudAppDB', 1);

        request.onupgradeneeded = function (event) {
            db = event.target.result;
            var objectStore = db.createObjectStore('records', { keyPath: 'id', autoIncrement: true });
            objectStore.createIndex('name', 'name', { unique: false });
            objectStore.createIndex('email', 'email', { unique: false });
        };

        request.onsuccess = function (event) {
            db = event.target.result;
            vm.getRecords();
        };

        request.onerror = function (event) {
            console.error("IndexedDB error: " + event.target.errorCode);
        };

        vm.addRecord = function () {
            var transaction = db.transaction(['records'], 'readwrite');
            var objectStore = transaction.objectStore('records');
            objectStore.add(vm.newRecord);
            vm.newRecord = {};
            vm.getRecords();
        };

        vm.updateRecord = function (record) {
            var transaction = db.transaction(['records'], 'readwrite');
            var objectStore = transaction.objectStore('records');
            var request = objectStore.put(record);
            request.onsuccess = function (event) {
                console.log("Record updated successfully");
            };
            request.onerror = function (event) {
                console.error("Error updating record: " + event.target.errorCode);
            };
        };

        vm.deleteRecord = function (id) {
            var transaction = db.transaction(['records'], 'readwrite');
            var objectStore = transaction.objectStore('records');
            objectStore.delete(id);
            vm.getRecords();
        };

        vm.getRecords = function () {
            var transaction = db.transaction(['records'], 'readonly');
            var objectStore = transaction.objectStore('records');
            var records = [];
            objectStore.openCursor().onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    records.push(cursor.value);
                    cursor.continue();
                } else {
                    $scope.$apply(function () {
                        vm.records = records;
                    });
                }
            };
        };
    }]);
