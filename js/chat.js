var BCHAT = function () {
	return {};
}();
jQuery(document).ready(function() {
    BCHAT.menu.init(), BCHAT.chat.init(), BCHAT.templates.init(), BCHAT.functions.init()
}),
BCHAT = function (e, n) {
	return e.chat = {
		/**
		  * @desc Initiate chat
		*/
		init: function() {
			var e = this;
			var submitting = false; //to prevent double submits
			BCHAT.noActivity = 0;
			BCHAT.lastID = null;
			//submit login form
			n('#loginForm').submit(function(t){
				t.preventDefault()
				if(submitting) return false;
				submitting = true;
				
				/*If post working
				$.bPost('login',n(this).serialize(),function(r){
					submitting = false;
					r.error ? BCHAT.functions.displayError('error') : e.login(r.name,r.email);
				});*/

				var name = n('input[name="name"]').val();
				var email = n('input[name="email"]').val();

				//If name form is empty return error
				if(name.length == 0){
					BCHAT.functions.displayError('Error')
					submitting = false;
					return false;
				}
				//Do login
				e.login(name,email);
				return false;
			});

			//submit chat text form
			n('#submitForm').submit(function(t){
				t.preventDefault()
				var text = n('#chatText').val();

				//if field is empty
				if(text.length == 0){
					return false;
				}
				if(submitting) return false;
				submitting = true;

				//check conversation ID
				var convId = n('ul.chat:visible').attr('id');
				
				// Assigning a temporary ID to the chat:
				var tempID = 't'+Math.round(Math.random()*1000000),
					params = {
						id			: tempID,
						author		: BCHAT.name,
						convId 		: convId,
						text		: text.replace(/</g,'&lt;').replace(/>/g,'&gt;')
					};

				// Add text to screen				
				BCHAT.functions.addChatText(n.extend({},params));
				n('#chatText').val(''); //empty field

				/* // send POST AJAX request:
				$.bPost(/conversation/:conversationid/message/send,n(this).serialize(),function(r){
					submitting = false;
					
					n('#chatText').val('');
					n('div.chat-'+tempID).remove();
					
					params['id'] = r.insertID;
					BCHAT.functions.addChatText(n.extend({},params));
				});*/
				submitting = false;
				return false;
			});
		}, 
		/**
		  * @desc provides the login in the chat
		  * @param string $name - user name
		  * @param string $email - user email
		*/
		login: function(name, email){
			BCHAT.name = name; //set user name
			n('#loginForm').fadeOut(function(){
				n('#collapseChat .panel-body').prepend(BCHAT.templates.render('userList',null)); //render userList
				(function getUsersTimeoutFunction(){
					e.functions.getUsers(getUsersTimeoutFunction); //get Users
				})();
				e.functions.contactLinks(); //add click to newly created users
				n('#collapseChat .panel-body').removeClass('panel-body-sm'); //Remove class on body
			});
		}
	}, e
}(BCHAT || {}, jQuery),
BCHAT = function(e, n) {
	"use strict";
	return e.menu = {
		/**
		  * @desc menu and visual functions
		*/
        init: function() {
            n(".btn-chatToggle").click(function() { //Close or open chat window
            	var t = n(this).children('.glyphicon');
				n("#collapseChat").hasClass("collapse in") ? (
				    e.menu.closeChat(), t.removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up')
				) : (
				    e.menu.openChat(), t.removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down')
				);
            })
        },
        /**
		  * @desc open chat window
		*/
        openChat: function() {
            n("#collapseChat").collapse('show')
        },
        /**
		  * @desc close chat window
		*/
        closeChat: function() {
            n("#collapseChat").collapse('hide')
        },
        /**
		  * @desc open contact list
		*/
        openContacts: function() {
			n('#userlist').removeClass('hidden');
	        if ( n('.btn-contacts-toggle').length ) {
	            n('.btn-contacts-toggle').remove()
	        }
	        //hide all chats
            n("ul.chat").each( function () {
            	n(this).addClass('hidden');
            });
            //set chat title
            n('.chat-title').html(' Chat')
        },
        /**
		  * @desc close contact list
		*/
        closeContacts: function() {
            n('#userlist').addClass('hidden'); //hide userlist
	        if ( !n('.btn-contacts-toggle').length ) { //if button don't exists create it
	        	var contactsToggle = n('<a/>', {
			        html: '<span class="glyphicon glyphicon-menu-left"></span>',
			        type: 'button',
			        class: 'btn btn-link btn-xs btn-contacts-toggle',
			        click: function () { 
			        	e.menu.openContacts();
			        	e.menu.hideSubmitForm();
			        }
			    });

			   n('#chatButtons').prepend(contactsToggle); //add button
	        }
        },
        /**
		  * @desc show message field
		*/
        showSubmitForm: function() {
        	n('#submitForm').removeClass('hidden');	
        	n('#chatText').focus();
        },
        /**
		  * @desc hide message field
		*/
        hideSubmitForm: function() {
        	n('#submitForm').addClass('hidden');	
        }
	}, e
}(BCHAT || {}, jQuery),
BCHAT = function (e, n) {
	"use strict";
	return e.functions = {
		/**
		  * @desc General Functions: POST, GET, Obtain users, add chat text, etc
		*/
		init: function () {
			BCHAT.users = [];
		},
		/**
		  * @desc general GET function
		  * @param string $action - url to get
		  * @param string $data - data to send
		  * @param function $callback - A callback function that is executed if the request succeeds
		*/
		bGet: function (action,data,callback) {
			n.get(action,data,callback,'json');
		},
		/**
		  * @desc general POST function
		  * @param string $action - url to post to
		  * @param string $data - data to send
		  * @param function $callback - A callback function that is executed if the request succeeds
		*/
		bPost: function (action,data,callback) {
			n.post(+action,data,callback,'json');
		},
		/**
		  * @desc get users list
		  * @param function $callback - A callback function that is executed if the request succeeds
		*/
		getUsers: function(callback){
			this.bGet('http://assignment.bunq.com/users',function(r){
				var users = [], len;

				for(var i=0; i< r.length;i++){
					if(r[i] && r[i].name != BCHAT.name){
						users.push(BCHAT.templates.render('user',r[i]));
						BCHAT.users.push(r[i]);
					}
				}
				var message = '';
				
				r.length<1 ? (
						message = 'No one is online'
				) : (
					message = users.length+' '+(users.length == 1 ? 'person':'people')+' online'
				);
				
				users.push('<p class="count">'+message+'</p>');				
				n('#collapseChat #userlist').html(users.join('')); //add to userlist
				setTimeout(callback,15000); //check every 15sec if new users
			});
		},
		/**
		  * @desc general GET function
		  * @param obj $params - message parameters: id, text, author, time
		*/
		addChatText: function(params){
			// All times are displayed in user's timezone
			var d = new Date();
			if(params.time) {
				// If UTC convert
				d.setUTCHours(params.time.hours,params.time.minutes);
			}
			params.time = (d.getHours() < 10 ? '0' : '' ) + d.getHours()+':'+
						  (d.getMinutes() < 10 ? '0':'') + d.getMinutes();
			
			//Render if message is from me
			if (params.author == BCHAT.name) {
				var markup = BCHAT.templates.render('chatLineR',params);
			} 
			else var markup = BCHAT.templates.render('chatLineL',params);
			
			//check if message exists
			var exists = n('#chatLineHolder .chat-'+params.id);
			//if exists remove it
			if(exists.length){
				exists.remove();
			}

			// If this isn't a temporary chat:
			if(params.id.toString().charAt(0) != 't'){
				var previous = n('ul.chat .chat-'+(+params.id - 1));
				if(previous.length){
					previous.after(markup);
				}
				else n('#'+params.convId).append(markup);
			}
			else n('#'+params.convId).append(markup);
		},
		/**
		  * @desc get Old Chats
		  * @param function $callback - A callback function that is executed if the request succeeds
		*/
		getChats: function(callback){
			/* //getConversations
			$.bGet(/conversation/:id,{lastID: BCHAT.lastID},function(r){
				
				for(var i=0;i<r.length;i++){
					if (r.author == BCHAT.name) {
						var markup = BCHAT.templates.render('chatLineR',r);
					} 
					else var markup = BCHAT.templates.render('chatLineL',r);
				}
				
				if(r.length){
					BCHAT.noActivity = 0;
					BCHAT.lastID = r[i-1].id;
				}
				else chat.data.noActivity++; // If no chats were received, increment counter.
									
				// Setting a timeout for the next request, depending on the chat activity:
				
				var nextReq = 1000;
				
				// 2 seconds
				if(BCHAT.noActivity > 3){
					nextReq = 2000;
				}
				
				if(BCHAT.noActivity > 10){
					nextReq = 5000;
				}
				
				// 15 seconds
				if(BCHAT.noActivity > 20){
					nextReq = 15000;
				}
			
				setTimeout(callback,nextReq);
			});*/
		},
		/**
		  * @desc provides functionality to each contact
		  * @param function $callback - A callback function that is executed if the request succeeds
		*/
		contactLinks : function (callback) {
			n('#userlist').on('click', 'li', function(t){
				var userId = n(this).attr('id').replace('user-', '');
				var userName = n(this).text();
				var params = {
					userId : userId,
					name : userName
				};
				e.functions.openConversation(params);
            })
		},
		/**
		  * @desc open or create new conversation
		  * @param obj $params - userId, name
		*/
		openConversation: function (params) {
			e.menu.showSubmitForm();
			e.menu.closeContacts();

			var exists = n('#conv-'+params.userId);

			if(exists.length){
				exists.removeClass('hidden');
			} else {
				if (params.userId>0) {
					var tempID = 'conv-'+params.userId,
					intparams = {
						id : tempID,
					};
					n('#collapseChat .panel-body').prepend(BCHAT.templates.render('chatList',intparams));
				}
			}
			n('.chat-title').html('<strong>'+params.name+'<strong> Chat')
			//Get old chats
			/*(function getOldChatsFunction(){
				e.functions.getChats(getOldChatsFunction);
			})();*/
		},
		/**
		  * @desc show errors
		  * @param string $msg message text
		*/
		displayError : function(msg){
			var elem = n('<div>',{
				id		: 'chatErrorMessage',
				class   : 'alert alert-warning',
				html	: msg
			});
			
			elem.click(function(){ //if click hide it
				n(this).fadeOut(function(){
					n(this).remove();
				});
			});
			
			setTimeout(function(){ //hide it after 5 sec
				elem.click();
			},5000);
			
			elem.hide().appendTo('body').slideDown(); //add it to window
		}
	}, e
}(BCHAT || {}, jQuery),	
BCHAT = function(e, n) {
	"use strict";
	return e.templates = {
		/**
		  * @desc Render elements
		*/
		init: function () {
			
		},
		/**
		  * @desc General Functions: POST, GET, Obtain users, add chat text, etc
		  * @param string $template template to render
		  * @param obj $params template parameters
		*/
		render : function(template,params){
			var arr = [];
			switch(template){
				case 'chatLineR': //chat message right
					arr = [
					'<li class="right clearfix chat chat-',params.id,'"><span class="chat-img pull-right"><img src="http://placehold.it/50/55C1E7/fff&text=U" alt="',params.author,' Avatar" class="img-circle" /></span><div class="chat-body clearfix"><div class="header"><small class=" text-muted"><span class="glyphicon glyphicon-time"></span>',params.time,'</small><strong class="pull-right primary-font">',params.author,
						'</strong></div><p>',params.text,'</p></div></li>'];
				break;
				case 'chatLineL': //chat message left
					arr = [
					'<li class="left clearfix chat chat-',params.id,'"><span class="chat-img pull-left"><img src="http://placehold.it/50/55C1E7/fff&text=U" alt="',params.author, ' Avatar" class="img-circle" /></span><div class="chat-body clearfix"><div class="header"><strong class="primary-font">',params.author,'</strong> <small class="pull-right text-muted"><span class="glyphicon glyphicon-time"></span>',params.time,'</small></div><p>',params.text,'</p></div></li>']
				break;
				case 'userList':  //userlist
					arr = ['<ul id="userlist"></ul>'];
					break;
				case 'chatList':  //chat window
					arr = ['<ul class="chat" id="',params.id,'"></ul>'];
					break;
				case 'user':  //users
					arr = ['<li class="left clearfix" id="user-',params.id,'"><span class="user-img pull-left"><img src="http://placehold.it/50/55C1E7/fff&text=U" alt="User Avatar" class="img-circle" /></span><div class="user-body clearfix"><div class="header"><strong class="primary-font">',params.name,'</strong></div></div></li>'];
				break;
			}
			return arr.join('');
		}
	},e
}(BCHAT || {}, jQuery)
;