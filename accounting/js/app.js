function CalculatorCtrl($scope){
    $scope.res = '';
    $scope.buttons = ['7','8','9','←','C','4','5','6','∗','÷','1','2','3','+','-','1','2','3','+','-','0','.','(',')','='];
    $scope.historyItems = [];
    $scope.update = function(a){
        $scope.res += a;
    };
}
