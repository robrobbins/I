require 'set'
# An instance of a dependency object
class Dependant
  
  attr_accessor :is_cdn, :is_vendor
  
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
  end
  
  def filename; @filename; end
  def requires 
    return '[' << @requires << ']' 
  end
  def provides
    if @is_vendor == true or @is_cdn == true
      "['#{@provides}']"
    else
      '[' << @provides << ']'
    end
  end
  def requires_array; @requires_array; end
  def provides_array; @provides_array; end
  
  def provides_append(val)
    if @provides_appended == false
      @provides << val
      @provides_appended = true
    else
      @provides << ', ' << val
    end
  end
  
  def provides_to_array
    if @provides != ''
      @provides_array = format_array(@provides.split(','))
    else
      @provides_array = []
    end
  end
  
  def requires_append(val)
    if @requires_appended == false
      @requires << val
      @requires_appended = true
    else
      @requires << ', ' << val
    end
  end
  
  def requires_to_array
    if @requires != ''
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

module Dependencies
  # a list of dependency objects
  @all = []
  # these have provide / require statements
  @matched = {}
  # namespaces which have been found
  @resolved = []
  # regexes for finding our define statements
  @def_ns_deps_and_cb = /define\s*\(\s*(['"A-Za-z.\/_]*),\s*\[(['" A-Za-z,.\/_]*)\](?:.*)/
  @def_deps_and_cb = /define\s*\(\s*\[(['" A-Za-z,.\/_]*)\](?:.*)/
  @def_ns_and_obj = /define\s*\(\s*(['"A-Za-z.\/_]*),\s*\{(?:.*)/
  @re_require = /require\s*\(\s*(['"A-Za-z.\/_]+)\s*\)/
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
        if data = @def_ns_deps_and_cb.match(line)
          is_dep = true
          data.captures.each_with_index {|o,i|
            if i == 0
              dep.provides_append(o)
            elsif i == 1
              dep.requires_append(o)
            end
          }
        elsif mdata = @def_deps_and_cb.match(line)
          is_dep = true
          dep.requires_append(mdata.captures[0])
        elsif ndata = @def_ns_and_obj.match(line)
          is_dep = true
          dep.provides_append(ndata.captures[0])
        elsif odata = @re_require.match(line)
          is_dep = true
          dep.requires_append(odata.captures[0])  
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
        dep.provides_append(prov)
        # provide for formatting the output correctly
        dep.is_vendor = true
        # third_party libs cannot declare requires[].
        @all.unshift(dep)
      end
    }
  end
  
  def self.add_cdn(cdns)
    # will not use source_files as we don't have them
    cdns.each {|k, v|
      # v[0] should be the actual URI of the dependency
      dep = Dependant.new(v)
      # it provides a namespace object
      dep.provides_append(k)
      dep.is_cdn = true
      @all.unshift(dep)
    }
  end

  def self.build_matched_hash
    @all.each { |dep|
      puts "found #{dep.filename}"
      # build the provides array from the string
      dep.provides_to_array()
      dep.provides_array.each {|ns|
        puts "it provides #{ns}"
        # dont provide the same ns more than once
        if ns != '' and @matched[ns].nil?
          # {namespace: dependency}
          puts "assigning #{ns} to matched hash"
          @matched[ns] = dep
        else
          puts "#{@matched[ns]} already provided by #{ns}"
        end
      }
    }
  end
  
  def self.resolve_deps
    @matched.each_value { |dep|
      dep.requires_to_array()
      dep.requires_array.each { |req|
        puts "Resolving required namespace #{req}"
        if result = resolve_req(req)
        else
          puts "Missing provider for #{req}"
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