"use strict";

(function (angular, undefined) {
    var calculatorApp = angular.module('calculatorApp', []);

    calculatorApp.value('buttons', ['7', '8', '9', '←', 'C', '4', '5', '6', '×', '÷', '1', '2', '3', '+', '-', '0', '.', '(', ')', '=']);

    calculatorApp.service('result', function () {
        return {
            regOpenBracket: /\(/g,
            regCloseBracket: /\)/g,
            regExpInBrackets: /(\([^()]+\))/,
            regIsCalculated: /\s=\s\-?[0-9]+\.?[0-9]*$/,
            regOperatorIsLast: /(\.|\s[+-×÷]\s|\-)$/,
            backSpace: function (exp) {
                return this.regIsCalculated.test(exp) ? '' : exp.replace(/\s*.\s*$/, '');
            },
            update: function (exp, a) {
                var result = '';

                // Clean result string if '=' is present or result string is '0' and Digit or Bracket button pressed
                if ((this.regIsCalculated.test(exp) || exp == '0') && /[0-9]|\.|\(/.test(a)) {
                    exp = '';
                }
                switch (a) {
                    case '+':
                    case '-':
                    case '×':
                    case '÷':
                    case '=':
                        exp = exp == '' ? '0' : exp.replace(this.regOperatorIsLast, '');
                        if (a == '-' && (exp == '0' || /\($/.test(exp))) {
                            exp = exp == '0' ? '' : exp;
                            result = a;
                        }
                        else if (this.regIsCalculated.test(exp)) {
                            exp = exp.replace(/^.+=\s/, '');
                            result = ' ' + a + ' ';
                        }
                        else {
                            result = ' ' + a + ' ';
                        }
                        break;
                    case '(':
                        if (!/([0-9]|\.)$/.test(exp)) {
                            result = a;
                        }
                        break;
                    case ')':
                        var open_bracket = this.regOpenBracket.test(exp) ? exp.match(this.regOpenBracket).length : 0;
                        var close_bracket = this.regCloseBracket.test(exp) ? exp.match(this.regCloseBracket).length : 0;
                        if (open_bracket > close_bracket && /[0-9]+/g.test(exp)) {
                            result = a;
                        }
                        break;
                    case '0':
                        if (exp != '0' && !/\)$/.test(exp)) {
                            result = a;
                        }
                        break;
                    case '.':
                        if (exp == '' || /\s$/.test(exp) || /\($/.test(exp)) {
                            result = '0' + a;
                        }
                        else if (!/\.[0-9]*$/.test(exp) && !/\)$/.test(exp)) {
                            result = a;
                        }
                        break;
                    default:
                        if (!/\)$/.test(exp)) {
                            result = a;
                        }
                }
                return exp + result;
            }
        };
    });

    calculatorApp.service('calculate', ['result', function (result) {
        return {
            _checkExp: function (exp) {
                if (exp == '' || result.regIsCalculated.test(exp)) {
                    return false;
                }
                else if (!/[0-9]\s[^()]\s[0-9]*.?[0-9]+/g.test(exp)) {
                    return false;
                }
                else {
                    var test_open_bracket = result.regOpenBracket.test(exp),
                        test_close_bracket = result.regCloseBracket.test(exp);
                    if (test_open_bracket && !test_close_bracket) {
                        return false;
                    }
                    else if (test_open_bracket && test_close_bracket && exp.match(result.regOpenBracket).length != exp.match(result.regCloseBracket).length) {
                        return false;
                    }
                }
                return true;
            },
            _calcSimpleExp: function (exp) {
                var k, x, y;
                exp = exp.replace('(', '').replace(')', '').split(' ');
                while (exp.length > 1) {
                    if (exp.indexOf('∗') != -1 || exp.indexOf('÷') != -1) {
                        for (var i = 0; i < exp.length; i++) {
                            if (exp[i] == '∗' || exp[i] == '÷') {
                                oneOperation(i);
                            }
                        }
                    }
                    else {
                        oneOperation(1);
                    }
                }
                function oneOperation(i) {
                    x = exp[i - 1].split('.');
                    y = exp[i + 1].split('.');
                    if (x[1] && y[1]) {
                        x[1] = '' + x[1];
                        y[1] = '' + y[1];
                        k = Math.pow(10, x[1].length > y[1].length ? x[1].length : y[1].length);
                    }
                    else if (x[1]) {
                        x[1] = '' + x[1];
                        k = Math.pow(10, x[1].length);
                    }
                    else if (y[1]) {
                        y[1] = '' + y[1];
                        k = Math.pow(10, y[1].length);
                    }
                    else {
                        k = 1;
                    }
                    switch (exp[i]) {
                        case '×':
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
                    exp.splice(i, 2);
                }
                return exp[0].toString();
            },
            cEval: function (exp, a) {
                var res = '',
                    success = false;
                if (this._checkExp(exp)) {
                    res = result.update(exp, a);
                    while (result.regExpInBrackets.test(exp)) {
                        exp = exp.replace(result.regExpInBrackets, _calcSimpleExp(result.regExpInBrackets.exec(exp)[0]));
                    }
                    exp = this._calcSimpleExp(exp);
                    res += exp;
                    success = true;
                }
                else {
                    res = exp;
                }
                return {
                    result: res,
                    success: success
                };
            }
        };
    }]);

    calculatorApp.controller('CalculatorCtrl', ['$scope', 'buttons', 'result', 'calculate', function ($scope, buttons, result, calculate) {
        $scope.buttons = buttons;
        $scope.res = '';
        $scope.historyItems = [];
        $scope.update = function (a) {
            var scope_res_new;
            switch (a) {
                case 'C':
                    $scope.res = '';
                    break;
                case '←':
                    $scope.res = result.backSpace($scope.res);
                    break;
                case '=':
                    scope_res_new = calculate.cEval($scope.res, a);
                    if (scope_res_new.success) {
                        $scope.res = scope_res_new.result;
                        $scope.historyItems.push($scope.res);
                    }
                    break;
                default:
                    $scope.res = result.update($scope.res, a);
            }
        };
    }]);
})(angular);
