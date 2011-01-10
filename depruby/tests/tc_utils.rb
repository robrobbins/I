require '../Utils'
require 'test/unit'

class TestUtils < Test::Unit::TestCase
  def setup
    # change to the root 'I' directory
    Dir.chdir('../../')
  end
  
  def test_is_directory
    assert(true, Utils.is_directory('js'))
  end
  
  def test_is_file
    assert(true, Utils.is_file('js/i.js'))
  end
  
  def test_is_js_file
    assert(true, Utils.is_js_file('js/i.js'))
  end
end