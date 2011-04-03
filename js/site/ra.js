I.provide('TEST.reallyawesome');
I.provide('TEST.alsoreallyawesome');

TEST.reallyawesome.hello = function() {
	return 'Also, reallyawesome namespace exists and is ready for use.';
};

TEST.alsoreallyawesome.hello = function() {
	return 'Also, also, Somebody likes long names...';
};