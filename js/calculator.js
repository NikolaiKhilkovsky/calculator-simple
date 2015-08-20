var historyData = ['dsfgsdf','sdfsdfs','sdfsadf'];

var CalcBox = React.createClass({
    updateResult: function(a){
        var res = this.state.result;
        /**
         * TODO: create calculate algorithm
         */
        switch(a){
            case 'C':
                this.setState({'result': this.props.result});
                break;
            case '-':
            case '+':
            case '=':
                a = this.state.result == '0' ? '0' : ' ' + a + ' ';
            case '00':
                a = this.state.result == '0' ? '0' : a;
            case '.':
                a = /\.[0-9]*$/.test(this.state.result) ? '' : a;
                a = this.state.result == '0' ? '0' + a : a;
            default:
                this.setState({'result': this.state.result == '0' ? a : this.state.result + a});
        }
        
    },
    getInitialState: function() {
        return {
            result: this.props.result,
            historyData: this.props.historyData
        };
    },
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

var CalcBody = React.createClass({
    getInitialState: function(){
        return {buttonsList: ['7','8','9','C','4','5','6','-','1','2','3','+','0','00','.','=']};
    },
    handleClick: function(a){
        this.props.onButtonClick(a);
    },
    render: function(){
        var calcButtons = this.state.buttonsList.map(function(buttonData){
            return <button className="calcButton" onClick={this.handleClick.bind(null, buttonData)}>{buttonData}</button>;
        }.bind(this));
        return (
            <div className="calcBody">
                <div className="showResult">{this.props.result}</div>
                <div className="buttons">{calcButtons}</div>
            </div>
        );
    }
});

var CalcHistory = React.createClass({
    render: function(){
        var historyItems = this.props.data.map(function(item){
            return (
                <div className="item">{item}</div>
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
    <CalcBox historyData={historyData} result="0" />,
    document.getElementById('calculator')
);
