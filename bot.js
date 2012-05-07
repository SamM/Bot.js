(function(){
	
function command(command, exam){
	var self = this;
	function com(input, callback){
		input = input+"";
		if(typeof callback!="function") 
			callback = function(){};
		
		var com = command, coml = command.length,
			msg = input.slice(coml);
			
		if(input.slice(0,coml)==com) 
			return exam.call(self, msg, callback);
			
		return false;
	};
	com.command = command;
	return com;
}


var Bot = function(options, ready){
	var bot = this;
	bot.commands = {};
	bot.run = command('', function(input, callback){
		for(var com in bot.commands)
			bot.commands[com](input, callback);
		return bot;
	});
	bot.command = function(com, exam){
		bot.commands[com] = command.call(this, com, exam);
		return bot;
	}
	options = options||{};
	for(var opt in options)
		bot[opt] = options[opt];
	if(typeof ready == 'function')
		ready.call(bot, bot);
};

this.Bot = Bot;

/*
var testBot = new Bot({name: 'testBot'}, 
function(bot){
	this.command("say ", function(input, cb){
		var msg = this.name+": "+input;
		console.log(msg);
		cb(null, msg);
	})
});

testBot.run("say 123").run("say abc", function(){ console.log('Done'); });
//>testBot: 123
//>testBot: abc
//>Done
*/

}).call(this);