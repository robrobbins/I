require 'set'
require './dependant.rb'
require './demaximizer.rb'

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
  
  def self.build_from_files(files, min)
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
      dep.txt = f.read
      f.close
      # iterate each line and look for statements
      dep.txt.each_line {|line|
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
          dep.no_callback = true
          dep.provides_append(ndata.captures[0])
        elsif odata = @re_require.match(line)
          is_dep = true
          dep.requires_append(odata.captures[0])
        end
      }
      @all.push(dep) if is_dep
    }
  end

  def self.add_third_party(files, ven_dirs)
    # if the file is in the ven_dir, remove its .js extension and use
    # that as the provided namespace
    sources = Set.new(files)
    sources.each {|file|
      dep = Dependant.new(file)
      # ven_dir should have been hashed already
      if ven_dirs.include? File.dirname(file)
        dep.provides_append(File.basename(file, '.js'))
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
      # v should be the actual URI of the dependency
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
      puts dep
      dep.requires_to_array()
      dep.requires_array.each { |req|
        puts "Resolving required namespace #{req}"
        if result = resolve_req(req)
          puts 'resolved'
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