# An instance of a dependency object
class Dependant
  # the boolean instance vars
  attr_accessor :async, :defer
  
  def initialize(filename)
    @filename = filename
    @provides = []
    @requires = []
  end
  
  def filename; @filename; end
  def requires; @requires; end
  def provides; @provides; end
  
  def provides_push(val)
    @provides.push(val)
  end
  
  def get_provides
    return get_collection(@provides)
  end
  
  def requires_push(val)
    @requires.push(val)
  end
  
  def get_requires
    return get_collection(@requires)
  end
  
  def get_collection(which)
    # need them encased in single quotes
    # TODO can we do this w/interp somehow? 
    str = '['
    which.each {|x| str = str + "'" + x + "'" + ","}
    # remove the last comma
    if str[-1] == 44: str[-1] = '' end
    str += ']'
    return str
  end
  
  def get_load_attrs
      if @async.nil?: @async = false end
      if @defer.nil?: @defer = false end
      return "#{@async}, #{@defer}"
  end
  
  def to_s
    ps = @provides.join(',')
    rs = @requires.join(',')
    "#{@filename} provides (#{ps}), requires (#{rs}), async = #{@async} and defer = #{@defer}"
  end
end