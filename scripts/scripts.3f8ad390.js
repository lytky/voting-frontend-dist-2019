(function(){"use strict";angular.module("hyyVotingFrontendApp",["ngCookies","ngResource","ngRoute","ngSanitize","ngTouch","restangular","pascalprecht.translate"]).constant("LOCALES",{locales:{fi:"Suomi",se:"Svenska",en:"English"},preferredLocale:"fi"}).constant("DEBUG_MODE",!0).config(["$translateProvider","DEBUG_MODE","LOCALES",function(a,b,c){return a.useStaticFilesLoader({prefix:"resources/locale-",suffix:".json"}),a.preferredLanguage(c.preferredLocale),a.useMissingTranslationHandler("missingTranslationHandler"),a.useSanitizeValueStrategy("sanitize"),a.useLocalStorage()}]).config(["$routeProvider",function(a){return a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl",controllerAs:"main"}).when("/sign-up",{templateUrl:"views/sign-up.html",controller:"SignUpCtrl",controllerAs:"session"}).when("/sign-in",{templateUrl:"views/sign-in.html",controller:"SignInCtrl",controllerAs:"session"}).when("/sign-out",{templateUrl:"views/sign-out.html",controller:"SignOutCtrl",controllerAs:"signOut"}).when("/results",{templateUrl:"views/results.html",controller:"ResultCtrl",controllerAs:"result"}).when("/vote",{templateUrl:"views/vote.html",controller:"VoteCtrl",controllerAs:"vote"}).when("/elections",{templateUrl:"views/elections.html",controller:"ElectionsCtrl",controllerAs:"elections"}).when("/profile",{templateUrl:"views/profile.html",controller:"ProfileCtrl",controllerAs:"profile"}).otherwise({redirectTo:"/"})}])}).call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").controller("MainCtrl",["Environment",function(a){this.isElectionsActive=a.isElectionsActive(),this.isEligibilityActive=a.isEligibilityActive(),this.isSignInActive=this.isEligibilityActive||this.isElectionsActive,this.eligibilitySignInStartsAt=a.eligibilitySignInStartsAt.format("DD.MM.YYYY hh:mm"),this.electionSignInStartsAt=a.electionSignInStartsAt.format("DD.MM.YYYY hh:mm")}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").controller("VoteCtrl",["$scope","$location","candidates","alliances","VoteSrv","errorMonitor",function(a,b,c,d,e,f){this.debug=!1,this.electionId=b.search().election,this.loadError=!1,this.loading=!0,this.selected=null,this.submitting=this.submitted=!1,this.alliances=[],this.candidates=[],this.savedVote=null,Promise.all([d.get(this.electionId),c.get(this.electionId),e.get(this.electionId)]).then(function(a){return function(b){return a.alliances=b[0],a.candidates=b[1],_.isEmpty(b[2])?void 0:(a.savedVote=b[2],a.selected=a.savedVote.candidate_id)}}(this),function(a){return function(b){return a.loadError=!0,f.error(b,"Fetching alliances/candidates failed")}}(this))["finally"](function(b){return function(){return b.loading=!1,a.$apply()}}(this)),this.isProspectSelected=function(){return null!==this.selected},this.select=function(a){return this.selected=a.id},this.isUnsaved=function(){return this.selected&&this.savedVote&&!_.isEmpty(this.savedVote)?this.selected!==this.savedVote.candidate_id:!1},this.submit=function(a){return this.submitting=!0,e.submit(this.electionId,a).then(function(b){return console.log("Vote submitted for id",a,b)},function(b){return function(c){return console.error("Vote failed for id",a,c),b.submitError=!0,f.error(c,"Vote failed")}}(this))["catch"](function(a){return function(b){return a.submitError=!0,f.error(b,"Vote failed for unknown error.")}}(this))["finally"](function(a){return function(){return a.submitted=!0,a.submitting=!1}}(this))}}]).filter("candidate",function(){return function(a,b){return(null!=a?a.name:void 0)===(null!=b?b.name:void 0)&&("undefined"!=typeof a&&null!==a?a.number:void 0)===(null!=b?b.number:void 0)?a:void 0}}).directive("voteProspect",function(){return{restrict:"E",template:"<span translate>.vote-ballot.header-number</span>: <strong>{{ prospect.number }}</strong>\n<br>\n<span translate>.vote-ballot.header-name</span>: <strong>{{ prospect.name }}</strong>",scope:{selected:"=vtSelected",all:"=vtAll"},link:function(a,b,c){return a.$watch("selected",function(b,c){return a.prospect=_.find(a.all,"id",b)})}}})}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").controller("SignUpCtrl",["SessionSrv","$scope","$location","errorMonitor",function(a,b,c,d){this.loading=!1,this.submitted=!1,this.error=null,this.email=null,this.requestLink=function(b){return this.loading=!0,a.requestLink(b).then(function(a){return function(b){return a.submitted=!0}}(this),function(a){return function(b){var c;return console.error("Failed requesting link",b),a.error=b,(null!=(c=a.error.data)?c.key:void 0)?a.error.translation_key=a.error.data.key:a.error.is_unknown=!0}}(this))["catch"](function(a){return function(b){return d.error(b,"Requesting session link failed"),a.error=b}}(this))["finally"](function(a){return function(){return a.loading=!1}}(this))}}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").service("SessionSrv",["$window","Restangular","elections",function(a,b,c){this.requestLink=function(a){return b.all("sessions").all("link").post({email:a})},this.signIn=function(a){return b.all("sessions").post({token:a}).then(function(a){return function(b){return a.save(b)}}(this))},this.signOut=function(){return new Promise(function(b,c){return b(a.sessionStorage.clear())})},this.getJwt=function(){return a.sessionStorage.getItem("jwt")},this.getUser=function(){var b;try{return JSON.parse(a.sessionStorage.getItem("user"))}catch(c){return b=c,console.log("Could not get current user",b),{}}},this.getVoter=function(){var b;try{return JSON.parse(a.sessionStorage.getItem("voter"))}catch(c){return b=c,console.error("Could not get current voter",b),null}},this.save=function(b){return new Promise(function(d,e){var f;return a.sessionStorage.setItem("jwt",b.jwt),a.sessionStorage.setItem("user",JSON.stringify(b.user)),a.sessionStorage.setItem("voter",JSON.stringify(b.voter)),b.elections?(c.save(b.elections),f="elections"):f="eligibility",d({type:f})})}}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").controller("SignInCtrl",["$location","$window","SessionSrv","errorMonitor",function(a,b,c,d){this.loading=!0,this.token=a.search().token,this.error=!1,this.invalidToken=!1,this.privateBrowsingModeError=!1,this.redirectAccordingTo=function(b){return"elections"===b.type?a.path("/elections"):"eligibility"===b.type?a.path("/profile"):(this.error=!0,this.invalidToken=!0,d.error("Unknown session type: "+b.type))},c.signIn(this.token).then(function(b){return function(c){return a.search("token",null),b.redirectAccordingTo(c)}}(this),function(a){return function(b){return a.error=!0,22===b.code&&"QuotaExceededError"===b.name?(console.error("private browsing mode :/"),a.privateBrowsingModeError=!0):403!==b.status?(d.error(b,"Sign in failed for other reason than HTTP 403"),a.invalidToken=!0):a.invalidToken=!0,console.error("Sign in failed: ",b)}}(this))["finally"](function(a){return function(){return a.loading=!1}}(this))}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").factory("alliances",["SessionRestangular","elections",function(a,b){return{get:function(b){return a.one("elections",b).all("alliances").getList()}}}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").factory("candidates",["SessionRestangular","elections",function(a,b){return{get:function(b){return a.one("elections",b).all("candidates").getList()}}}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").run(["Restangular",function(a){return a.setBaseUrl("/api")}]).config(["RestangularProvider",function(a){return a.setDefaultHttpFields({timeout:1e4})}]).service("SessionRestangular",["Restangular","SessionSrv",function(a,b){return a.withConfig(function(a){return a.setDefaultHeaders({Authorization:"Bearer "+b.getJwt()})})}]).service("UnauthenticatedRestangular",["Restangular",function(a){return a}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").directive("setClassWhenAtTop",["$window",function(a){var b;return b=angular.element(a),{restrict:"A",link:function(a,c,d){var e,f,g,h;return g=d.setClassWhenAtTop,h=parseInt(d.paddingWhenAtTop,10),f=c.parent(),e=null,b.on("scroll",function(){return e=f.offset().top-h,b.scrollTop()>=e?(c.addClass(g),f.height(c.height())):(c.removeClass(g),f.css("height",null))})}}}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").controller("ResultCtrl",function(){})}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").service("VoteSrv",["SessionRestangular",function(a){this.submit=function(b,c){return a.one("elections",b).one("candidates",c).all("vote").post()},this.all=function(){return a.all("votes").getList()},this.get=function(b){return a.one("elections",b).one("vote").get()}}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").controller("ElectionsCtrl",["$scope","elections","VoteSrv","errorMonitor","Environment",function(a,b,c,d,e){this.all=null,this.votes=null,this.loading=!0,this.loadError=!1,this.isElectionsActive=e.isElectionsActive(),this.init=function(){return this.isElectionsActive?this.loadElections():this.loading=!1},this.loadElections=function(){return Promise.all([b.get(),c.all()]).then(function(a){return function(b){return a.all=b[0],a.votes=b[1]}}(this),function(a){return function(b){return a.loadError=b}}(this))["finally"](function(b){return function(){return b.loading=!1,a.$apply()}}(this))},this.init()}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").factory("elections",["$window",function(a){return{save:function(b){return a.sessionStorage.setItem("elections",JSON.stringify(b))},get:function(){return new Promise(function(b,c){var d;return d=a.sessionStorage.getItem("elections"),d?b(JSON.parse(d)):c("No elections available")})}}}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").directive("vtVoteStatus",["$sce",function(a){return{restrict:"EA",scope:{votes:"=vtVoteStatusVotes",election:"=vtVoteStatusElection"},link:function(a,b,c){var d;return d=_.find(a.votes,"election_id",a.election.id),null!=d?b.text("X"):void 0}}}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").factory("errorMonitor",["SessionSrv",function(a){return{error:function(b,c){return null==c&&(c=""),Rollbar.error(b,{msg:c,user:a.getUser()}),console.error("Reported unexpected error to Rollbar:",b,c,a.getUser())},warning:function(b,c){return null==c&&(c=""),Rollbar.warn(b,{msg:c,user:a.getUser()}),console.warn("Reported warning to Rollbar:",b,c,a.getUser())}}}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").service("Environment",function(){this.eligibilitySignInStartsAt=function(){return moment("2015-11-12 07:00","YYYY-MM-DD HH:mm").utcOffset("+0200")}(),this.eligibilitySignInEndsAt=function(){return moment("2015-12-14 17:00","YYYY-MM-DD HH:mm").utcOffset("+0200")}(),this.electionSignInStartsAt=function(){return moment("2015-12-15 09:00","YYYY-MM-DD HH:mm").utcOffset("+0200")}(),this.electionSignInEndsAt=function(){return moment("2015-12-15 20:00","YYYY-MM-DD HH:mm").utcOffset("+0200")}(),this.isEligibilityActive=function(){return moment().isAfter(this.eligibilitySignInStartsAt)&&moment().isBefore(this.eligibilitySignInEndsAt)},this.isElectionsActive=function(){return moment().isAfter(this.electionSignInStartsAt)&&moment().isBefore(this.electionSignInEndsAt)}})}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").controller("ProfileCtrl",["$location","SessionSrv",function(a,b){this.voter=b.getVoter(),this.redirect=function(){return a.path("/sign-up")},this.voter||this.redirect()}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").controller("SignOutCtrl",["SessionSrv",function(a){this.cleared=!1,a.signOut().then(function(a){return function(){return a.cleared=!0}}(this))}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").directive("vtTranslateLanguageSelect",["LocaleSrv",function(a){return{restrict:"AE",replace:!0,template:'<div class="btn-group language-select">\n  <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\n    <span ng-bind="currentLocaleName"></span> <span class="caret"></span>\n  </button>\n  <ul class="dropdown-menu">\n    <li ng-repeat="name in localeNames">\n      <a ng-click="changeLanguage(name)" ng-bind="name"></a>\n    </li>\n  </ul>\n</div>',controller:["$scope",function(b){var c;return b.currentLocaleName=a.getCurrentLocaleName(),b.localeNames=a.getLocaleNames(),b.localeKeys=a.getLocaleKeys(),b.visible=(null!=(c=b.localeNames)?c.length:void 0)>1,b.changeLanguage=function(c){return a.setLocaleByDisplayName(c),b.currentLocaleName=c}}]}}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").service("LocaleSrv",["$translate","LOCALES",function(a,b){this.findKeyByValue=function(a){var c,d,e;e=b.locales;for(c in e)if(d=e[c],d===a)return c},this.getLocaleNames=function(){return _.values(b.locales)},this.getLocaleKeys=function(){return _.keys(b.locales)},this.getCurrentLocaleName=function(){return b.locales[a.proposedLanguage()]},this.setLocaleByDisplayName=function(b){return a.use(this.findKeyByValue(b))}}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").factory("missingTranslationHandler",["$translate","errorMonitor",function(a,b){return function(a,c){return b.warning("Missing translation key: '"+a+"' (lang: '"+c+"')"),"MISSING: '"+a+"'"}}])}.call(this),angular.module("hyyVotingFrontendApp").run(["$templateCache",function(a){"use strict";a.put("views/_contact.html",'<!-- N.B. This embeddable view is agnostic of the Bootstrap grid --> <div translate-namespace="partials.contact"> <h4 translate>.more_info</h4> <ul> <li> <a href="https://hyy.helsinki.fi/fi/yhteiskunta-yliopisto/vaikuttaminen-yliopistolla/hallintovaalit" translate>.hyy_ae_link_caption</a> </li> <li> <span translate>.in_case_of_fire</span> <a href="mailto:vaalit@hyy.fi">vaalit@hyy.fi</a> </li> <li> <!-- #TODO: yhteyshenkilö --> Silva Loikkanen +358 50 551 6147 </li> </ul> </div>'),a.put("views/_info.html",'<div class="col-xs-12 col-sm-6" translate-namespace="partials.info"> <h4 translate>.main_title</h4> <p translate=".ingress"></p> <p> <span translate>.signin_is_available_at</span> <br> <!-- #TODO: Vaalipäivät --> <span translate>.election_dates_explained</span> </p> </div> <div class="col-xs-12 col-sm-6" ng-include src="\'views/_contact.html\'"></div>'),a.put("views/elections.html",'<div class="page-header"> <h1 translate> pages.elections.page_title </h1> </div> <div class="row"> <div class="col-xs-12"> <div ng-if="elections.loading" translate> common.loading </div> </div> </div> <div class="jumbotron alert alert-info" ng-if="elections.loadError" translate-namespace="pages.elections"> <div class="container"> <h1 translate>.sign_in</h1> <p class="lead" translate> .request_link_please </p> <a ng-href="#/sign-up" class="btn btn-primary" translate> .button_request_link </a> </div> </div> <div ng-if="!elections.isElectionsActive" class="row" translate-namespace="pages.elections.not_started"> <div class="col-xs-12"> <p translate> .voting_has_not_started_yet </p> </div> </div> <div class="row" ng-if="elections.all.length == 0" translate-namespace="pages.elections.empty"> <div class="col-xs-12"> <p translate> .no_elections_available </p> </div> </div> <div ng-if="!elections.loadError && !elections.loading && elections.isElectionsActive && elections.all.length > 0" class="row" translate-namespace="pages.elections"> <div class="col-xs-12"> <p translate> .you_can_vote_in_the_following </p> <table class="table table-striped table-hover"> <thead> <th translate>.table_header.election_name</th> <th translate>.table_header.status</th> </thead> <tbody> <tr ng-repeat="election in elections.all"> <td> <a ng-href="#/vote?election={{ election.id }}">{{ election.name }}</a> </td> <td> <vt-vote-status vt-vote-status-votes="elections.votes" vt-vote-status-election="election"></vt-vote-status> </td> </tr> </tbody> </table> </div> </div>'),a.put("views/main.html",'<div class="jumbotron" translate-namespace="pages.main"> <div> <h1 translate>.page_title</h1> <p class="lead"> <img src="images/logo/hyy-seppele.7e86a1e7.png" style="margin: 1.5em; height: 150px" alt="HYYn logo"><br> </p> <p class="lead" translate ng-if="main.isEligibilityActive"> .you_may_check_eligibility <!--  eng. the right to vote and to stand as candidate --> <!-- #TODO: päivämäärä --> </p> <p class="lead" translate ng-if="main.isElectionsActive"> .you_may_request_session_link <!-- #TODO: päivämäärä --> </p> <div ng-if="!main.isSignInActive"> <p class="lead" translate> .signin_will_commence_at </p> <p> <span translate>.eligibility_check</span> <strong><span ng-bind="main.eligibilitySignInStartsAt"></span></strong> <br> <span translate>.voting</span> <strong><span ng-bind="main.electionSignInStartsAt"></span></strong> </p> </div> <p ng-if="main.isSignInActive"> <a class="btn btn-lg btn-success" ng-href="#/sign-up"> <span ng-if="main.isEligibilityActive" translate> .button_caption_eligibility </span> <span ng-if="main.isElectionsActive" translate> .button_caption_vote </span> <span class="glyphicon glyphicon-ok"></span> </a> </p> </div> </div> <div class="row" ng-include="\'views/_info.html\'"></div>'),a.put("views/profile.html",'<div class="page-header"> <h1 translate>pages.profile.page_title</h1> </div> <div class="row" translate-namespace="pages.profile"> <div class="col-xs-12"> <p translate> .you_are_eligible </p> <dl class="dl-horizontal"> <dt translate>.voter.name</dt> <dd ng-bind="profile.voter.name"></dd> <dt translate>.voter.email</dt> <dd ng-bind="profile.voter.email"></dd> <dt translate>.voter.phone</dt> <dd ng-bind="profile.voter.phone"></dd> <dt translate>.voter.faculty</dt> <dd ng-bind-template="{{ profile.voter.faculty.name }} ({{ profile.voter.faculty.code }})"></dd> <dt translate>.voter.department</dt> <dd ng-bind-template="{{ profile.voter.department.name }} ({{ profile.voter.department.code }})"></dd> </dl> <p translate> .in_case_of_problem </p> </div> </div> <div class="row"> <div class="col-xs-12 col-sm-6" ng-include src="\'views/_contact.html\'"></div> </div> '),a.put("views/results.html",'<div class="page-header"> <h1>Vaalitulos</h1> </div> <div class="row"> <div class="col-xs-12 col-sm-8"> <h4>Tulospalvelu</h4> <p> #TODO Missä hallintovaalien tulos julkaistaan? </p> <p> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce a feugiat lorem. In interdum elit in odio sollicitudin, quis feugiat massa ullamcorper. Morbi lacinia facilisis augue in maximus. Nullam id aliquam libero. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Morbi neque lacus, scelerisque nec egestas eu, porta eget lectus. Sed luctus dolor non vestibulum tempor. </p> </div> <div class="col-sm-4" ng-include src="\'views/_contact.html\'"></div> </div>'),a.put("views/sign-in.html",'<!-- This page is only presented on an error. User is redirected on success. --> <div class="row" translate-namespace="pages.sign_in"> <div class="col-xs-12"> <div ng-if="session.loading" translate> .loading </div> <div ng-if="!session.loading"> <div ng-if="session.error"> <div class="jumbotron alert alert-danger"> <div ng-if="session.invalidToken"> <div class="container"> <h1 translate>.error.title_invalid_key</h1> <p class="lead" translate> .error.lead </p> <p> <a translate ng-href="#/sign-up" class="btn btn-primary"> .error.request_new_link </a> </p> </div> </div> <div ng-if="session.privateBrowsingModeError"> <div class="container"> <h1 translate>.error.private_browsing_mode.title</h1> <p class="lead" translate> .error.private_browsing_mode.lead </p> <p translate> .error.private_browsing_mode.what_now </p> </div> </div> </div> </div> </div> </div> <!-- col --> </div> <!-- row -->'),a.put("views/sign-out.html",'<div class="page-header"> <h1 translate>pages.sign_out.page_title</h1> </div> <div class="row" translate-namespace="pages.sign_out"> <div class="col-xs-12 col-sm-8"> <p ng-if="signOut.cleared" translate> .ingress </p> </div> </div>'),a.put("views/sign-up.html",'<div class="page-header"> <h1 translate>pages.sign_up.page_title</h1> </div> <div class="row" translate-namespace="pages.sign_up"> <div class="col-xs-12"> <p translate> .ingress </p> <p translate> .password_instructions </p> <p> <span translate>.spam_instructions</span> <span translate>.in_case_of_fire</span> <!-- #TODO: yhteystiedot --> </p> <p> <strong translate>.attention</strong> <!-- #TODO: vaalipäivät --> <li translate>.election_dates_explained</li> <li translate>.staff_eligibility_note</li> </p> <form class="form-horizontal css-form" name="request"> <div class="form-group"> <label for="email" class="col-sm-2 control-label" translate=".input_caption_email"> </label> <div class="col-sm-10"> <div class="input-group"> <span class="input-group-addon">@</span> <input type="email" class="form-control" placeholder="firstname.lastname@helsinki.fi" required ng-disabled="session.loading || session.submitted" ng-model="session.email"> </div> </div> </div> <div class="form-group"> <div class="col-sm-offset-2 col-sm-10"> <button type="submit" class="btn btn-default btn-primary" ng-disabled="request.$invalid || session.loading" ng-hide="session.submitted || session.error" ng-click="session.requestLink(session.email)"> <div ng-show="session.loading"> <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span> <span translate=".button_caption_submitting"></span> </div> <span ng-hide="session.loading" translate> .button_caption_submit </span> </button> <div ng-show="session.submitted"> <p translate> .link_has_been_sent </p> <p translate> .pls_check_email </p> </div> <div class="alert alert-danger" ng-show="session.error"> <p> <strong translate>.something_went_wrong.detail</strong> </p> <p ng-if="!session.error.is_unknown"> <span translate="{{session.error.translation_key}}" translate-namespace=".errors"></span> </p> <p translate> .something_went_wrong.if_happens_again <!-- #TODO: yhteystieto --> </p> <div ng-if="session.error.is_unknown"> <p> <hr> <span translate> .something_went_wrong.pls_explain </span> <br> Status: <span ng-bind="session.error.status"></span> <br> Data: <span ng-bind="session.error.data | json"></span> </p> </div> </div> </div> </div> </form> </div> <!-- col --> </div> <!-- row -->'),a.put("views/vote.html",'<div class="page-header"> <h1 translate> pages.vote.page_title </h1> </div> <div class="jumbotron alert alert-danger" ng-if="vote.loadError" translate-namespace="pages.vote.error"> <div class="container"> <h1 translate> .something_went_wrong </h1> <p translate> .could_not_load_candidates </p> <p translate> .request_a_new_link_and_try_again </p> <a ng-href="#/sign-up" class="btn btn-primary" translate> .button_request_link </a> </div> </div> <div class="row" translate-namespace="pages.vote"> <div class="col-xs-12"> <form novalidate ng-hide="vote.loadError"> <div> <!-- required container for set-class-when-at-top --> <div class="panel panel-primary vote-ballot" set-class-when-at-top="fix-to-top" padding-when-at-top="10"> <!-- N.B. padding-when-at-top must match the fixed position px,\n               otherwise a jumpy side-effect will occurr --> <div class="panel-heading"> <h3 class="panel-title" translate>.vote-ballot.title</h3> </div> <div class="panel-body"> <span ng-hide="vote.isProspectSelected()" translate> .vote-ballot.ingress </span> <vote-prospect ng-show="vote.isProspectSelected()" vt-selected="vote.selected" vt-all="vote.candidates"> </vote-prospect> <div ng-if="vote.isUnsaved()" class="alert alert-warning"> <p translate> .vote-ballot.about-to-change-existing-vote </p> </div> </div> <div class="panel-footer"> <button class="btn btn-primary" ng-click="vote.submit(vote.selected)" ng-disabled="!vote.isProspectSelected() || vote.submitting || vote.submitted" ng-hide="vote.submitted"> <div ng-show="vote.submitting && !vote.submitted"> <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span> <span translate>.vote-ballot.submitting</span> </div> <div ng-hide="vote.submitting || vote.submitted || vote.submitError" translate> .vote-ballot.button-submit-caption </div> </button> <div class="alert alert-success" role="alert" ng-if="vote.submitted && !vote.submitError"> <p> <strong translate>.vote-has-been-cast</strong> </p> <p> <span translate>.if-you-are-eligible-in-others</span> <a ng-href="#/elections" translate>.choose-next-election</a>. </p> <p translate> .close-window-when-finished </p> </div> <div class="alert alert-danger" role="alert" ng-if="vote.submitError"> <strong>Äänestäminen epäonnistui!</strong> <p> Lataa äänestyssivu uudelleen selaimen refresh-toiminnolla ja yritä äänestää uudelleen. </p> <p> Jos ongelma toistuu, ota yhteys HYYn vaalityöntekijään HYYn vaalityöntekijään vaalit@hyy.fi +358 50 551 6147 </p> </div> </div> </div> </div> <div ng-if="vote.loading"> <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span> </div> <div ng-if="!vote.loading"> <!-- SEARCH --> <div class="form-horizontal"> <h2 translate>.search.title</h2> <!--\n          <div class="form-group">\n            <label for="candidateNumber" class="col-sm-3 control-label">Numero</label>\n            <div class="col-sm-8">\n              <input class="form-control" ng-model="vote.candidate.number">\n            </div>\n          </div>\n          --> <div class="form-group"> <label for="candidateName" class="col-sm-3 control-label" translate> .search.candidate-name </label> <div class="col-sm-8"> <input class="form-control" ng-model="vote.candidate.name"> </div> </div> </div> <!-- ALLIANCES --> <div ng-repeat="a in vote.alliances" ng-show="filteredCandidates.length"> <h1 ng-bind="a.name"></h1> <!-- CANDIDATES OF ALLIANCE --> <table class="table table-striped table-hover"> <thead> <th></th> <th translate>.search.header-number</th> <th translate>.search.header-candidate</th> </thead> <tbody> <tr ng-repeat="c in filteredCandidates = (a.candidates | filter:vote.candidate)" ng-class="{ \'info\': vote.selected == c.id }"> <td> <label> <input type="radio" ng-disabled="vote.submitting || vote.submitted" ng-model="vote.selected" ng-value="c.id"> </label></td> <td ng-click="vote.select(c)">{{ c.number }}</td> <td ng-click="vote.select(c)">{{ c.name }}</td>  </tr>  </tbody></table> </div> </div> <!-- /loading --> </form> </div> <!-- col --> </div> <!-- row -->')}]);