# A Mixin that allows Dependant class instances to minify themselves
# via Closure compiler REST service. Using this API you could easily write
# a module to use a different service or a local tool as well.
require 'yaml'
require 'net/http'
require 'uri'

CFG = YAML.load_file('config.yaml') unless defined? CFG
DM = CFG['demaximizer']

module Demaximizer
  
  # return the minified js
  def minify
    url = URI.parse(DM['url'])
    params = Hash.new
    params['js_code'] = @txt
    params['compilation_level'] = DM['comp_level']
    params['output_format'] = DM['output_format']
    params['output_info'] = DM['output_info']
    
    req = Net::HTTP::Post.new(url.path)
    # TODO privide a hook for setting headers via config
    req['Content-type'] = 'application/x-www-form-urlencoded'
    req.set_form_data(params)
    res = Net::HTTP.new(url.host, url.port).start {|http| http.request(req)}
    case res
    when Net::HTTPSuccess, Net::HTTPRedirection
      return res.body
    else
      res.error!
    end
  end
  
  # handle adjusting the name of dependencies from foo.js to 
  # foo.[min_suffix].js or path/to/foo.js to path/to/foo.[min_suffix].js
  def rename(str, inc_path)
    ext = '.js'
    name = File.basename(str, ext)
    name << DM['min_suffix'] << ext
    if inc_path
      # using a passed in path as it will be adjusted for [rm_dir] by now
      path = File.dirname(str) << '/'
      return path << name
    else  
      return name
    end
  end

end
