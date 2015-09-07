angular.module('calc', []).
value('result', {
    regOpenBracket: /\(/g,
    regCloseBracket: /\)/g,
    regExpInBrackets: /(\([^()]+\))/,
    regIsCalculated: /\s=\s\-?[0-9]+\.?[0-9]*$/,
    backSpace: function(exp){

        return exp;
    },
    checkExp: function(exp){
        if(exp == '' || this.regIsCalculated.test(exp)){
            return false;
        }
        else if(!/[0-9]\s[^()]\s[0-9]*.?[0-9]+/g.test(exp)){
            return false;
        }
        else {
            var test_open_bracket = this.regOpenBracket.test(exp),
                test_close_bracket = this.regCloseBracket.test(exp);
            if(test_open_bracket && !test_close_bracket){
                return false;
            }
            else if(test_open_bracket && test_close_bracket && exp.match(this.regOpenBracket).length != exp.match(this.regCloseBracket).length){
                return false;
            }
        }
        return true;
    },
    update: function(exp, a){
        var result = '';

        // Clean result string if '=' is present or result string is '0' and Digit or Bracket button pressed
        if((this.regIsCalculated.test(exp) || exp == '0') && /[0-9]|\.|\(/.test(a)){
            exp = '';
        }
        switch (a){
            case '+':
            case '-':
            case '∗':
            case '÷':
            case '=':
                exp = exp == '' ? '0' : exp.replace(/(\.|\s\+\s|\s\-\s|\s\*\s\|s\÷\s)$/, '');
                if(a == '-' && (exp == '0' || /\($/.test(exp))){
                    exp = exp == '0' ? '' : exp;
                    result = a;
                }
                else if(this.regIsCalculated.test(exp)){
                    exp = exp.replace(/^.+=\s/, '');
                    result = ' ' + a + ' ';
                }
                else {
                    result = ' ' + a + ' ';
                }
                break;
            case '(':
                if(!/([0-9]|\.)$/.test(exp)){
                    result = a;
                }
                break;
            case ')':
                var open_bracket = this.regOpenBracket.test(exp) ? exp.match(this.regOpenBracket).length : 0;
                var close_bracket = this.regCloseBracket.test(exp) ? exp.match(this.regCloseBracket).length : 0;
                if(open_bracket > close_bracket && /[0-9]+/g.test(exp)){
                    result = a;
                }
                break;
            case '0':
                if(exp != '0' && !/\)$/.test(exp)){
                    result = a;
                }
                break;
            case '.':
                if(exp == '' || /\s$/.test(exp) || /\($/.test(exp)){
                    result = '0' + a;
                }
                else if(!/\.[0-9]*$/.test(exp) && !/\)$/.test(exp)){
                    result = a;
                }
                break;
            default:
                if(!/\)$/.test(exp)){
                    result = a;
                }
        }
        return exp + result;
    },
    calculate: function(exp, a){
        var result = '',
            success = false;
        if(this.checkExp(exp)){
            result = this.update(exp, a);
            while(this.regExpInBrackets.test(exp)){
                exp = exp.replace(this.regExpInBrackets, this._calcSimpleExp(this.regExpInBrackets.exec(exp)[0]));
            }
            exp = this._calcSimpleExp(exp);
            result += exp;
            success = true;
        }
        else {
            result = exp;
        }
        return {
            result: result,
            success: success
        };
    },
    _calcSimpleExp: function(exp){
        //TODO доделать функцию - неверно посчитано выражение 25 - 20 + 2 ∗ 10 = 250
        var k, x, y;
        exp = exp.replace('(', '').replace(')', '').split(' ');
        while(exp.length > 1){
            if(exp.indexOf('∗') != -1 || exp.indexOf('÷') != -1){
                for (var i = 0; i < exp.length; i++){
                    if(exp[i] == '∗' || exp[i] == '÷'){
                        oneOperation(i);
                    }
                }
            }
            else {
                oneOperation(1);
            }
        }
        function oneOperation(i){
            x = exp[i - 1].split('.');
            y = exp[i + 1].split('.');
            if(x[1] && y[1]){
                x[1] = '' + x[1];
                y[1] = '' + y[1];
                k = Math.pow(10, x[1].length > y[1].length ? x[1].length : y[1].length);
            }
            else if(x[1]){
                x[1] = '' + x[1];
                k = Math.pow(10, x[1].length);
            }
            else if(y[1]){
                y[1] = '' + y[1];
                k = Math.pow(10, y[1].length);
            }
            else {
                k = 1;
            }
            switch(exp[i]){
                case '∗':
                    exp[i - 1] = '' + ((parseFloat(exp[i - 1]) * k) * (parseFloat(exp[i + 1]) * k)) / (k * k);
                    break;
                case '÷':
                    exp[i - 1] = '' + ((parseFloat(exp[i - 1]) * k) / (parseFloat(exp[i + 1]) * k));
                    break;
                case '+':
                    exp[i - 1] = '' + ((parseFloat(exp[i - 1]) * k) + (parseFloat(exp[i + 1]) * k)) / k;
                    break;
                case '-':
                    exp[i - 1] = '' + ((parseFloat(exp[i - 1]) * k) - (parseFloat(exp[i + 1]) * k)) / k;
                    break;
            }
            exp.splice(1, 2);
        }
        return exp[0].toString();
    }
});

angular.module('calculatorApp', ['calc']).
value('buttons', ['7','8','9','←','C','4','5','6','∗','÷','1','2','3','+','-','0','.','(',')','=']);

var CalculatorCtrl = function($scope, buttons, result){
    $scope.buttons = buttons;
    $scope.res = '';
    $scope.historyItems = [];
    $scope.update = function(a){
        var scope_res_new;
        switch(a){
            case 'C':
                $scope.res = '';
                break;
            case '←':
                $scope.res = result.backSpace($scope.res);
                break;
            case '=':
                scope_res_new = result.calculate($scope.res, a);
                if(scope_res_new.success){
                    $scope.res = scope_res_new.result;
                    $scope.historyItems.push($scope.res);
                }
                break;
            default:
                $scope.res = result.update($scope.res, a);
        }
    };
}
CalculatorCtrl.$inject = ['$scope', 'buttons', 'result'];
