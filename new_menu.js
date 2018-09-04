var checkMQ = require("./checkMQ");
// global.jQuery = require("jquery");
var $ = require("jquery");

	var Menu = function(el,controlPanel,breadcrums,header_menu,options){
		this.options = this.extend({},this.options)
		this.extend(this.options, options)
		this.window = $(window);
		this.el = el;
		this.header_menu = header_menu
		this.menu = [].slice.call(el.find(".menu_level"));
		this.panel = [].slice.call(controlPanel.find(".buttonMenu"))
		this.breadcrums = breadcrums
		this.menus = [...this.menu, ...this.panel, ...this.breadcrums]
		this.current = 0;
		this.scrollTop = 0;
		this.neValue = "";
		this.keyBoard = [
						['f', 'а'],[',', 'б'],['d', 'в'],['u', 'г'],['l', 'д'],['t', 'е'],['`', 'е'],['ё', 'е'],[';', 'ж'],
						['p', 'з'],['b', 'и'],['q', 'й'],['r', 'к'],['k', 'л'],['v', 'м'],['y', 'н'],['j', 'о'],['g', 'п'],
						['h', 'р'],['c', 'с'],['n', 'т'],['e', 'у'],['a', 'ф'],['[', 'х'],['w', 'ц'],['x', 'ч'],['i', 'ш'],
						['o', 'щ'],['m', 'ь'],['s', 'ы'],[']', 'ъ'],["'", 'э'],['.', 'ю'],['z', 'я']
					];
		this.animateClass = "";
		this.currentAnimateClass = "";
		this.cities = [];
		this.url  = "../json/cities.json"; //API города (адрес для тестов /test/test_wifire/json/cities.json) /WiFire/json/cities.json
		this.init();
	};

	Menu.prototype.extend = function(a,b){
		for( var key in b ) { 
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}

	Menu.prototype.resize = function(){
		var self = this;
		$(window).resize(function(){
			if($(window).width() >= 1024){
				$(self.el).removeClass("menu_open")
				$(".wrap").css({"display":""})
				$(".overlay").remove()
			}
		})
	}

	Menu.prototype.init = function(){
		this.menusArr = [];
		this.dataType = [];
		var self = this;
		this.menus.forEach(function(el,i){
			var menu = {
				menuEl : el,
				items: [].slice.call($(el).find(".menu_item")),
				dataType: $(el).attr("data-menu"),
				category: [].slice.call($(el).find(".category"))
			}
			self.menusArr.push(menu)
			if(i === self.current){
				$(el).addClass("current_visible")
			}
		})
		this.resize()
		this.initEvents()
		// this.close()
		var dataType = this.menusArr.filter(function(e){
			return e.dataType
		})
		dataType.forEach(function(el,i){
			self.dataType.push(el.dataType)
		})
		self.getCities()
		
	};
	Menu.prototype.options = {
		category: [
			{
			 "category": ['Тарифы','Об услуги','Как смотреть','Аналоговое телевидение'],
			 "link": ["www.wifire.ru","www.wifire.ru","www.wifire.ru","www.wifire.ru"]
			},
			{
			 "category": ['Тарифы','Об услуги','Как смотреть','Аналоговое телевидение'],
			 "link": ["www.wifire.ru","www.wifire.ru","www.wifire.ru","www.wifire.ru"]
			},
			{},
			{},
			{
			 "category": ['Тарифы','Об услуги','Как смотреть','Аналоговое телевидение'],
			 "link": ["www.wifire.ru","www.wifire.ru","www.wifire.ru","www.wifire.ru"]
			},
		]
	}

	Menu.prototype.initEvents = function(){
		var self = this;
		var current_menu;
		$(this.menusArr).each(function(i,el){

			self.buttonMenuInit(el,self)


			self.submenuInit(el,self)


			if(self.options.categoryMenuMobile){ 

					$(el.category).each(function(i,el){
						$(self.options.category).each(function(pos,elem){
							if(i == pos){
								if($.isEmptyObject(elem)) return
								$(el).addClass("has-children")
								$(el).find("a").after("<ul></ul>")
								$(elem.category).each(function(pos,e){
									$(el).find("ul").append(`<li><a href="${elem.link[pos]}">${e}</a></li>`)
								})
								$(el).on("click", function(){
									console.log($(el).siblings().removeClass("selected"))
									$(this).toggleClass("selected")
								})
							}
						});
					})
				}
			});

			self.breadcrumsInit()


		if(this.options.findCityDesktop){
				this.header_menu.find(".city a").on("click", function(e){

				e.preventDefault()

				$("body").append(`<div class='overlay'>
									<div class="popUp">
										<em class="icon icon_cross"></em>
										<p>Начните вводить название:</p>
										<input type="text"/>
										<div class="cities">

										</div>
									</div>
								  </div>`)

				$(".overlay .icon").on("click", function(){
					$(".overlay").remove()
				})
				var arr = self.cities.sort(function(a,b){
					var c = a.name
					var d = b.name
					if(c < d){
						return -1;
					}else if(c > d){
						return 1;
					}
				})

				self.renderCitiesDecktop(arr)


				$(".popUp input").on("change keyup", function(){
					var matchArr = self.findMatches(this.value, self.cities)
					var dec = matchArr.length/4;
					var html = "<div>";
						if(!matchArr.length) return
						html +="<span tabindex"+matchArr[0].location+"><a href='#'>"+matchArr[0].name+"</a></span>"

					for(var i = 1; i < matchArr.length; i++){
						html+="<span tabindex"+matchArr[i].location+"><a href='#'>"+matchArr[i].name+"</a></span>"

						if(i == (dec-1)){
							html+="</div><div>"
							i++
						}else if(i % dec == 0){
							html+="</div><div>"
						}
						
					}
					// console.log(html)
					$(".popUp").addClass("active")
					$(".popUp .cities").html(html)
				})
			});
		}
	}
	Menu.prototype.breadcrumsInit = function(self){
		var self = this;
		this.breadcrums.find(".action").on("click", function(){
			self.el.removeClass("menu_open")
			$(self.menusArr[self.current].menuEl).removeClass(self.currentAnimateClass)
			$(self.menusArr[self.current].menuEl).removeClass("current_visible")
			self.currentAnimateClass = ""
			$(".wrap").css({display: "block"})
			$(".back").remove()
			$(window).scrollTop(self.scrollTop)
		});
	}

	Menu.prototype.buttonMenuInit = function(el,self){
		$(el.menuEl).each(function(i,item){
			if($(item).hasClass("buttonMenu")){
				$(item).on("click", function(e){
					var new_menu = $(this).attr("data-type");
					var index = self.dataType.indexOf(new_menu);
					if(new_menu){
						$(self.menusArr[self.current].menuEl).removeClass("current_visible")
						$(self.menusArr[index].menuEl).addClass('current_visible')
						$(self.el).addClass("menu_open")
						self.scrollTop = $(window).scrollTop()
						self.current = index
						$(".wrap").css({"display":"none"})
					}
				})
				
			}
		})
	}

	Menu.prototype.submenuInit = function(el, self){
		$(el.items).each(function(i,el){ 
			$(el).find("a").on("click",function(){
				var submenu = $(this).attr("data-submenu")
				var index = self.dataType.indexOf(submenu);
				if(submenu){
					$(self.menusArr[self.current].menuEl).addClass("animate_ToRight")
					self.prevAnimateClass = "animate_ToRight"

					$(self.menusArr[index].menuEl).addClass('animate_FromLeftToCenter')
					self.currentAnimateClass = "animate_FromLeftToCenter"

					self.endTransition(self.menusArr[self.current].menuEl, self.current, self.prevAnimateClass, self.currentAnimateClass) //текущее

					$(self.menusArr[index].menuEl).addClass('current_visible')

					self.current = index

					self.renderCities()

					self.renderMatches()

				}
				
			})
		})
	}
	Menu.prototype.renderCitiesDecktop = function(arr){
		var self = this;

		if(self.cities.length%4 ==0){
			var dec = self.cities.length/4;
		}else{
			var dec = (self.cities.length - self.cities.length % 4)/4+1
		}	

		var html = "<div>";
			if(!arr.length) return
			html+="<span tabindex"+arr[0].location+"><a href='#'>"+arr[0].name+"</a></span>"
		for(var i = 1; i < arr.length; i++){
			html+="<span tabindex"+arr[i].location+"><a href='#'>"+arr[i].name+"</a></span>"

			if(i == (dec-1)){
				html+="</div><div>"
				i++
			}else if(i % dec == 0){
				html+="</div><div>"
			}		
		}
		$(".popUp .cities").append(html)
	}

	Menu.prototype.renderCities = function(){
		var self = this;
		for(var i = 0; i < self.cities.length; ++i){
			$(".cities").append(`<li tabindex=${self.cities[i].location}>${self.cities[i].name}</li>`)
		}
	}

	Menu.prototype.getCities = function(){
		var self = this;
		fetch(this.url)
			.then(blob => blob.json())
			.then(data => self.cities.push(...data))
			
	}

	Menu.prototype.renderMatches = function(){
		var self = this
		$(".findCities").on("change keyup", function(){
			var matchArr = self.findMatches(this.value, self.cities)
			var html = matchArr.map(city =>{
				return `
					<li>${city.name}</li>
				`
			}).join("");
			$(".submenu-1 .cities").html(html)
		})

		
	}

	Menu.prototype.findMatches = function(wordToMatch, cities){

		for(var i = 0; i < this.keyBoard.length; i++){
			if(wordToMatch == this.keyBoard[i][0]){
				wordToMatch = this.keyBoard[i][1]
				if(wordToMatch.length > 1){
					wordToMatch = wordToMatch.slice(wordToMatch.length-1)
				}
			}
		}
		return cities.filter(city => {
			const reqex = new RegExp(wordToMatch, 'gi');
			return city.name.match(reqex)
		})
	}

	Menu.prototype.endTransition = function(el,index,prevAnimClass,curAnimClass){
		var self = this;
		if(self.current == 0){

			$(self.breadcrums).append("<span class='back'>Назад</span>")

			$(".back").delay(600).fadeIn(200).on("click", function(){
				self.back(index)
			})
		}else{
			$(".back").remove()
		}
		$(el).on('webkitAnimationEnd oanimationend msAnimationEnd animationend',function(){
			
			$(self.menusArr[self.current].menuEl).removeClass(curAnimClass)
			$(this).removeClass(prevAnimClass+" current_visible")
			$(el).off('webkitAnimationEnd oanimationend msAnimationEnd animationend')
		})
		

	}
	Menu.prototype.back = function(index){

		$(this.menusArr[this.current].menuEl).addClass("animate_ToLeft")
		this.prevAnimateClass = "animate_ToLeft"

		$(this.menusArr[index].menuEl).addClass('animate_FromRightToCenter')
		this.currentAnimateClass = "animate_FromRightToCenter"

		this.endTransition(this.menusArr[this.current].menuEl, this.current, this.prevAnimateClass, this.currentAnimateClass)

		$(this.menusArr[index].menuEl).addClass('current_visible')

		this.current = this.dataType.indexOf(this.menusArr[index].dataType)
		

		
	}

module.exports = Menu;

	
	