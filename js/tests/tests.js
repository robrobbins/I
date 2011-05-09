// load all specs (which will have loaded all src files themselves)
// before calling jasmine.getEnv().execute()
define('TESTS', ['reallyAwesomeSpec', 'testSpec'], function() {
	
	jasmine.getEnv().addReporter(new jasmine.TrivialReporter());
  jasmine.getEnv().execute();

});