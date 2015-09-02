/**
 * Simple calculator script
 *
 * @author Nikolai Khilkovsky
 * @author khilkovn@gmail.com
 *
 * @requires react.js, JSXTransformer.js
 */

/**
 * @var Array - Calculator history data array
 */
var historyData = [];

/**
 * @var Function - React component - Main calculator element
 */
var CalcBox = React.createClass({
    /**
     * Update result function
     *
     * @param String - pressed button value
     */
    updateResult: function(a){
        var history = this.state.historyData; // Current history array
        var res = this.state.result;          // Current result string
        var u;                                // String for uppend to result

        // Clean result string if '=' is present or result string is '0' and Digit button pressed
        if((/\s=\s\-?[0-9]+\.?[0-9]*$/.test(res) || res == '0') && /[0-9]+|\./.test(a)){
            res = '';
        }

        // Check pressed button, set 'u' and update 'res' if needed
        switch(a){
            case 'C':
                this.setState({'result': this.props.result});
                return;
            case '-':
            case '+':
            case '=':
                res = res == '' ? '0' : res.replace(/(\.|\s\+\s|\s\-\s)$/, '');
                if(a == '=' && (!/(\s\+\s|\s\-\s).*[0-9]+$/.test(res) || /\s=\s\-?[0-9]+\.?[0-9]*$/.test(res)) ){
                    u = '';
                }
                else if(a == '-' && res == '0') {
                    res = '';
                    u = a;
                }
                else if((a == '-' || a == '+') && /\s=\s\-?[0-9]+\.?[0-9]*$/.test(res)){
                    res = res.replace(/^.+=\s/, '');
                    u = ' ' + a + ' ';
                }
                else {
                    u = ' ' + a + ' ';
                }
                break;
            case '0':
                u = res == '' ? '0' : a;
                u = res == '0' ? '' : a;
                break;
            case '00':
                if(res == '0'){
                    u = '';
                }
                else {
                    u = res == '' ? '0' : a;
                }
                break;
            case '.':
                if(res == '' || /\s$/.test(res)){
                    u = '0' + a;
                }
                else if(/\.[0-9]*$/.test(res)) {
                    u = '';
                }
                else {
                    u = a;
                }
                break;
            default:
                u = a;
        }

        // Nothing to do if String for uppend to result is empty
        if(u == ''){
            return;
        }

        // Update result string
        res += u;

        // If '=' button pressed calculate expression and update history
        if (a == '='){
            res += calculate(res.split(' '));
            history.push({'id': history.length ,'string': res});
            this.setState({'historyData': history});
        }

        // update result in view
        this.setState({'result': res});
    },

    /**
     * Get initial state function
     *
     * @return Object
     */
    getInitialState: function() {
        return {
            result: this.props.result,
            historyData: this.props.historyData
        };
    },

    /**
     * Render function
     */
    render: function(){
        return (
            <div className="calcBox">
                <h1>The Simple Calculator</h1>
                <div className="row">
                    <CalcBody result={this.state.result} onButtonClick={this.updateResult} />
                    <CalcHistory data={this.state.historyData} />
                </div>
            </div>
        );
    }
});

/**
 * @var Function - React component - calculator body element
 */
var CalcBody = React.createClass({
    /**
     * Get initial state function
     *
     * @return Object
     */
    getInitialState: function(){
        return {buttonsList: ['7','8','9','C','4','5','6','-','1','2','3','+','0','00','.','=']};
    },

    /**
     * Click button function
     *
     * @param String - pressed button value
     */
    handleClick: function(a){
        this.props.onButtonClick(a);
    },

    /**
     * Render function
     */
    render: function(){
        var calcButtons = this.state.buttonsList.map(function(buttonData){
            return <button className="calcButton" onClick={this.handleClick.bind(null, buttonData)} key={buttonData}>{buttonData}</button>;
        }.bind(this));
        return (
            <div className="calcBody">
                <div className="showResult">
                    <input type="text" placeholder="0" value={this.props.result} readOnly />
                </div>
                <div className="buttons">{calcButtons}</div>
            </div>
        );
    }
});


/**
 * @var Function - React component - calculator history element
 */
var CalcHistory = React.createClass({
    /**
     * Render function
     */
    render: function(){
        var historyItems = this.props.data.map(function(item){
            return (
                <div className="item" key={item.id}>{item.string}</div>
            )
        });
        return (
            <div className="calcHistory">
                <h3>Calculator history</h3>
                {historyItems}
            </div>
        );
    }
});

React.render(
    <CalcBox historyData={historyData} result="" />,
    document.getElementById('calculator')
);

/**
 * Calculator function
 *
 * @param Array expression - expresion array
 * @return String
 */
function calculate(expression){
    var k, x, y;
    while(expression.length > 2){
        x = expression[0].split('.');
        y = expression[2].split('.');
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
        switch(expression[1]){
            case '+':
                expression[0] = '' + (parseFloat(expression[0]) * k + parseFloat(expression[2]) * k) / k;
                break;
            case '-':
                expression[0] = '' + (parseFloat(expression[0]) * k - parseFloat(expression[2]) * k) / k;
                break;
        }
        expression.splice(1, 2);
    }
    return expression[0].toString();
}
