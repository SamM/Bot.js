(function(){
	var no_require = false;
	if(typeof require != 'function') no_require = true;

	var Bot = function(build_fn){
		var bot = this;
		this.commands = {};
		this.listeners = {};
		
		function command(comm, func, thisv){
			function _command(input, callback){
				bot.emit('command', comm, input);
				return func.call(thisv, input, callback);
			}
			_command.command = comm||"";
			return _command;
		}
		
		this.on = this.addListener = function(event_name, listener){
			if(!this.listeners[event_name])
				this.listeners[event_name] = [];
			if(typeof listener == "function")
				this.listeners[event_name].push(listener);
			return this;
		}
		
		this.emit = this.trigger = function(event_name){
			var args = [].slice.call(arguments, 1);
			var listeners = this.listeners[event_name];
			if(Array.isArray(listeners)){
				for(var i=0;i<listeners.length;i++)
					listeners[i].apply(this, args);
			}
			return this;
		}
		
		this.run = function(input, callback){
			this.emit('input', input);
			if(typeof callback != 'function') callback = function(errors, response){};
			if(typeof input == 'string'){
				for(var c in this.commands){
					if(input.indexOf(c) == 0){
						var output = input.slice(c.length + (input[c.length]==" "?1:0));
						this.commands[c](output, 
						function(err, response){
							var args = [].slice.call(arguments);
							if(err) bot.emit('error', err);
							else bot.emit('response', response);
							callback.apply(bot,args);
						});
					}
				}
			}else{
				bot.emit('error', "input type: must be a string");
			}
		}
		this.command = function(the_command, the_function, overwrite, callback){
			if(typeof callback != "function") callback = function(){};
			if(this.commands[the_command] && !overwrite){
				callback("Did not overwrite existing command", null);
				return this;
			}
			this.commands[the_command] = command(the_command, the_function, bot);
			this.commands[the_command].command = the_command;
			callback(null, this.commands[the_command]);
			return this;
		};
		if(!no_require){
			// Only if node.js
			this.command("load commands", function(input, callback){
				var args = input.split(' '),
					dir_path = args[0],
					overwrite = false,
					B = this;
				
				if(["-o", "overwrite"].indexOf(args[0]) > -1 || !args[0]){
					dir_path = "/commands"; // Default place to look for commands
					overwrite = true;
				}
				else if((args[1] && ["-o", "overwrite"].indexOf(args[1]) > -1))
					overwrite = true;
					
				if(dir_path.slice(-1) == "/") dir_path = dir_path.slice(0,-1);
				
				if(!dir_path){
					callback("Provide the path to a directory");
					return true;
				}
				console.log("Loading commands from "+__dirname+dir_path);
				require('fs').readdir(__dirname+dir_path, function(err, files){
					if(err) callback("Couldn't load directory: "+err);
					else {
						var added = [];
						files.forEach(function(file){
							if(file.indexOf('.js')==file.length-'.js'.length){
								file = file.slice(0, -3);
								try{
									var the_command = require("."+dir_path+"/"+file);
								}catch(e){
									B.emit('error', e)
									return;
								}
								if(typeof the_command != "function")
									return "Wrong type";
								if(typeof the_command.command != "string")
									the_command.command = file;
								
								B.command(the_command.command, the_command, overwrite, function(err, com){
									if(!err)
										added.push(the_command.command);
								});
							}
						});
						callback(null, added.length+" commands were added from "+dir_path+": \n\t"+added.join(", "));
					}
				});
			
				return true;
			});
		}
		this.command("commands", function(input, callback){
			var commands = [];
			for(var com in this.commands) commands.push(com);
			callback(null, commands.length+" commands: "+commands.join(", "));
		});
		
		if(typeof build_fn == 'function') build_fn.call(this);
	}
	
	this.Bot = Bot;
	
}).call(this);
if(module) module.exports = this.Bot;