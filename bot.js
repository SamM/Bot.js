(function(){
	
	function command(func, thisv){
		return function(){
			var args = [].slice.call(arguments);
			return func.apply(thisv, args);
		}
	}

	this.Bot = function(){
		var bot = this;
		this.commands = {};
		this.run = function(input, callback){
			if(typeof callback != 'function') callback = function(errors, response){};
			if(typeof input == 'text'){
				for(var c in commands){
					if(input.indexOf(c) == 0)
						this.commands[c](input.slice(c.length + input[c.length]==" "?1:0), callback);
				}
			}
		}
		this.command = function(the_command, the_function, overwrite, callback){
			if(typeof callback != "function") callback = function(){};
			if(this.commands[the_command] && !overwrite){
				this.commands[the_command] = command(the_function, this);
				this.commands[the_command].command = the_command;
				callback(null, this.commands[the_command]);
				return this;
			}
			callback("Did not overwrite existing command", null);
			return this;
		};
		this.command("load commands", function(input, callback){
			var args = input.split(' '),
				dir_path = args[0],
				overwrite = false,
				B = this;
				
			if(args[0]) return false;
			
			if(args[1] && ["-o", "overwrite"].indexOf(args[1]) > -1)
				overwrite = true;
			if(dir_path.slice(-1) == "/")
				dir_path = dir_path.slice(0,-1);
				
			if(!dir_path){
				callback("Provide the path to a directory");
				return true;
			}
				
			require('fs').readdir(dir_path, function(err, files){
				if(err) callback("Couldn't load directory: "+err);
				else {
					var added = [];
					files.forEach(function(file){
						if(file.indexOf('.js')==file.length-'.js'.length){
							file = file.slice(0, -3);
							var the_command = require(dir_path+"/"+file);
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
					callback(null, added.length+" commands were added from `"+dir_path+"`: "+added.join(", "));
				}
			});
			
			return true;
		});
	}

}).call(this);