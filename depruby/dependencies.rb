require 'set'
# An instance of a dependency object
class Dependant
  # the boolean instance vars
  attr_accessor :async, :defer
  
  def initialize(filename)
    @filename = filename
    @provides = []
    @requires = []
    @caches = []
    @async = nil
    @defer = nil
  end
  
  def filename; @filename; end
  def requires; @requires; end
  def provides; @provides; end
  def caches; @caches; end
  
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
  
  def caches_push(val)
    @caches.push(val)
  end
  
  def get_caches
    return get_collection(@caches)
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

module Dependencies
  # a list of dependency objects
  @all = []
  # these have provide / require statements
  @matched = {}
  # how the dependencies should be loaded
  @req_attr = {}
  # namespaces which have been found
  @resolved = []
  # regexes for finding our statements
  @re_provides = Regexp.new('I\.provide\s*\(\s*[\'\"]([^\)]+)[\'\"]\s*\)')
  @re_requires = Regexp.new('I\.require\s*\(\s*[\'\"]([^\)]+)[\'\"]\s*(?:,)*\s*(true|false)?\s*(?:,)*\s*(true|false)?\s*\)')
  @re_caches = Regexp.new('I\.cache\s*\(\s*[\'\"]([^\)]+)[\'\"]\s*\)')
  
  def self.build_from_files(files)
    # make sure there are no dupes in the files array
    sources = Set.new(files)
    #iterate through the array
    sources.each {|file|
      # make a dependant instance
      dep = Dependant.new(file)
      # should we push this one?
      is_dep = false
      # open the file and read it
      puts "opening #{file}"
      f = File.open(file)
      txt = f.read
      f.close
      # iterate each line and look for statements
      txt.each_line {|line|
        if data = @re_provides.match(line)
          is_dep = true
          data.captures.each {|i|
            dep.provides_push(i)
          }
        elsif mdata = @re_requires.match(line)
          is_dep = true
          # seperate the required namespace from the load
          # attributes of the script tag it writes
          mdata.captures.each_index {|j|
            # the first is a namespace
            if j == 0
              dep.requires_push(mdata.captures[0])
              # save the load attributes for this ns
              @req_attr[mdata.captures[0]] = {}
            # 1 is the async flag
            elsif j == 1
              @req_attr[mdata.captures[0]]['async'] = mdata.captures[1]
            # 2 is the defer flag
            elsif j == 2
              @req_attr[mdata.captures[0]]['defer'] = mdata.captures[2]
            end
          }
        elsif ndata = @re_caches.match(line)
          is_dep = true
          ndata.captures.each {|k|
            puts "pushing #{k} into cached array"
            dep.caches_push(k)
          }
        end
      }
      @all.push(dep) if is_dep == true
    }
  end

  # TODO this could be combined later for extra DRY-ness
  # this is fine for now...run this after build_from_files()
  def self.add_third_party(files, ven_dirs)
    # if the file is in the ven_dir, remove its .js extension and use
    # that as the provided namespace
    sources = Set.new(files)
    sources.each {|file|
      dep = Dependant.new(file)
      # ven_dir should have been hashed already
      if ven_dirs[File.dirname(file)]
        prov = File.basename(file, '.js')
        dep.provides_push(prov)
        # TODO without adding them manually, third_party libs
        # cannot declare requires[]. Do they then cease to be
        # '3rd party'? This may be a non-issue
        @all.unshift(dep)
      end
    }
  end
  
  def self.add_cdn(cdns)
    # will not use source_files as we don't have them
    cdns.each {|k, v|
      # v[0] should be the actual URI of the dependency
      dep = Dependant.new(v[0])
      # it provides a namespace object
      dep.provides_push(k)
      # TODO same as third_party (which these usually are), any
      # dependencies would need to be declared manually. this could easily
      # be done in the cdns{}. Is there a use case for this?
      @all.unshift(dep)
    }
  end

  def self.build_matched_hash
    @all.each { |dep|
      puts "found #{dep.filename}"
      dep.provides.each {|ns|
        puts "it provides #{ns}"
        if attr_obj = @req_attr[ns]
          # NOTE files will only get one set of load attributes
          # they could be overwritten if required 2 different ways...
          dep.async = attr_obj['async']
          dep.defer = attr_obj['defer']
          puts "and has the load attributes async = #{dep.async}, defer = #{dep.defer}"
        end
        # dont provide the same ns more than once
        if @matched[ns].nil?
          # {namespace: dependency}
          puts "assigning #{ns} to matched hash"
          @matched[ns] = dep
        else
          puts "#{@hash[ns]} already provided by #{ns}"
        end
      }
    }
  end
  
  def self.resolve_deps
    @matched.each_value { |dep|
      dep.requires.each { |req|
        puts "Resolving required namespace #{req}"
        if result = resolve_req(req)
          puts result
        else
          puts "Missing provider for #{req}"
          return false
        end
      }
      # now resolve the caches
      dep.caches.each { |c|
        puts "Resolving cached namespace #{c}"
        if result = resolve_req(c)
          puts result
        else
          puts "Missing provider for #{c}"
          return false
        end
      }
    }
    return true
  end
  
  def self.resolve_req(req)
    #require must be a file we know about
    if @resolved.include?(req)
      return "#{req} already resolved"
    elsif @matched[req]
      @resolved.push(req)
      return "#{req} is provided by #{@matched[req]}"
    end
  end
  
  def self.all
    @all
  end
  
  def self.matched
    @matched
  end
end