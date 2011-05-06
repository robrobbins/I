require './demaximizer.rb'

class Dependant
  # mixin allowing dependencies to minify themselves
  include Demaximizer
  
  attr_accessor :is_cdn, :is_vendor, :no_callback, :txt
  
  def initialize(filename)
    @filename = filename
    @provides = ''
    @provides_array = nil
    @requires = ''
    @requires_array = nil
    @provides_appended = false
    @requires_appended = false
    @re_quoted = /'(.*?)'/
    @is_vendor = false
    @is_cdn = false
    @no_callback = false
    @txt = nil
  end
  
  def filename; @filename; end
  
  def requires 
    return '[' << @requires << ']'
  end
  def provides
    if @is_vendor or @is_cdn
      "['#{@provides}']"
    else
      '[' << @provides << ']'
    end
  end
  def requires_array; @requires_array; end
  def provides_array; @provides_array; end
  
  def provides_append(val)
    if @provides_appended
      @provides << ', ' << val
    else
      @provides << val
      @provides_appended = true
    end
  end
  
  def provides_to_array
    if @provides
      @provides_array = format_array(@provides.split(','))
    else
      @provides_array = []
    end
  end
  
  def requires_append(val)
    if @requires_appended
      @requires << ', ' << val
    else
      @requires << val
      @requires_appended = true
    end
  end
  
  def requires_to_array
    if @requires
      @requires_array = format_array(@requires.split(','))
    else
      @requires_array = []
    end
  end
  
  def format_array(arr)
    arr.each_index {|i|
      if data = @re_quoted.match(arr[i])
        arr[i] = data.captures[0]
        arr[i].gsub!(/\s/, '')
      end
    }
    arr      
  end
  
  def to_s
    "#{@filename} provides (#{@provides}), requires (#{@requires})"
  end
end
