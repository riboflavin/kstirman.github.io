(function() {
  var log;

  log = console.log;

  window.dremioCalc = function(opts) {
    return $("[dremio-calc='app']").each(function() {
      var $app, animateVal, decodeHash, doCalc, encodeHash, hashUpdateTimer, initShare, initUI, initVals, inputs, outputs, share, updateHash, updateHashDebounced, vals;
      $app = $(this);
      inputs = {
        $size: $app.find("[dremio-calc='dataSize']"),
        $systems: $app.find("[dremio-calc='numSystems']"),
        $analysts: $app.find("[dremio-calc='numAnalysts']"),
        $scientists: $app.find("[dremio-calc='numScientists']")
      };
      outputs = {
        $techCosts: $app.find("[dremio-calc='techCosts']"),
        $peopleCosts: $app.find("[dremio-calc='peopleCosts']"),
        $totalCosts: $app.find("[dremio-calc='totalCosts']")
      };
      share = {
        $el: $('#share'),
        $input: $app.find("[dremio-calc='share']")
      };
      opts = opts || {
        minData: 10,
        minSourceSystems: 5,
        minPeopleSaved: 0.5,
        dataEngineer: 0.02,
        dataSourceMultiple: 0.2,
        costOfITPro: 120000,
        annualServerCost: 18000,
        annualSoftwareFees: 10000,
        dataPipeline: 0.3,
        storageSavings: 0.93,
        storageCostPerTB: 6500
      };
      vals = {
        size: 0,
        systems: 0,
        analysts: 0,
        scientists: 0
      };
      hashUpdateTimer = false;
      encodeHash = function(vals) {
        var hash, i, len, val;
        hash = "";
        for (i = 0, len = vals.length; i < len; i++) {
          val = vals[i];
          val = val.toString(35);
          hash += ("zz" + val).slice(-2);
        }
        return hash;
      };
      decodeHash = function(hash) {
        var data, i, ref, x, y;
        data = [];
        for (x = i = 0, ref = hash.length; i < ref; x = i += 2) {
          y = (hash[x] + hash[x + 1]).replace('z', '');
          data.push(parseInt(y, 35));
        }
        return data;
      };
      updateHash = function(vals) {
        if (history.replaceState) {
          history.replaceState(null, null, '#' + encodeHash(vals));
        } else {
          window.location.hash = '#' + encodeHash(vals);
        }
        share.$input.val(window.location.href);
        return share.$el.addClass('show');
      };
      updateHashDebounced = function(vals) {
        if (hashUpdateTimer) {
          clearTimeout(hashUpdateTimer);
          hashUpdateTimer = false;
        }
        return hashUpdateTimer = setTimeout(function() {
          return updateHash(vals);
        }, 250);
      };
      initVals = function() {
        var data, hash;
        hash = window.location.hash.replace('#', '');
        if (hash.length) {
          data = decodeHash(hash);
          inputs.$size.val(data[0]);
          inputs.$systems.val(data[1]);
          inputs.$analysts.val(data[2]);
          inputs.$scientists.val(data[3]);
          return share.$input.val(window.location.href);
        }
      };
      animateVal = function($input, newVal) {
        var oldVal;
        oldVal = parseInt($input.val().replace(/\D/g, ''));
        return $({
          val: oldVal
        }).animate({
          val: newVal
        }, {
          duration: 1000,
          easing: 'linear',
          step: function(val) {
            val = parseInt(val);
            return $input.val("$" + val.toLocaleString());
          }
        });
      };
      doCalc = function() {
        var dataSourcePeopleFactor, peopleCosts, peopleFactor, serverCosts, storageCosts, techCosts, totalCosts;
        vals.size = parseInt(inputs.$size.val() || 0);
        vals.systems = parseInt(inputs.$systems.val() || 0);
        vals.analysts = parseInt(inputs.$analysts.val() || 0);
        vals.scientists = parseInt(inputs.$scientists.val() || 0);
        dataSourcePeopleFactor = Math.max(opts.dataSourceMultiple * vals.systems, opts.minSourceSystems);
        peopleFactor = Math.max((vals.analysts + vals.scientists + dataSourcePeopleFactor) * opts.dataEngineer, opts.minPeopleSaved);
        storageCosts = Math.max(opts.minData, vals.size) * opts.storageCostPerTB;
        serverCosts = Math.max(opts.minSourceSystems, vals.systems) * opts.dataPipeline * (opts.annualServerCost + opts.annualSoftwareFees);
        techCosts = storageCosts + serverCosts;
        peopleCosts = peopleFactor * opts.costOfITPro;
        totalCosts = techCosts + peopleCosts;
        animateVal(outputs.$techCosts, techCosts);
        animateVal(outputs.$peopleCosts, peopleCosts);
        return animateVal(outputs.$totalCosts, totalCosts);
      };
      initUI = function() {
        var $input, input, results;
        results = [];
        for (input in inputs) {
          $input = inputs[input];
          $input.on('input', {
            input: input
          }, function(e) {
            inputs[e.data.input].not(this).val($(this).val());
            doCalc();
            return updateHashDebounced([vals.size, vals.systems, vals.analysts, vals.scientists]);
          });
          results.push($input.on('blur', {
            input: input
          }, function(e) {
            if (!$(this).val()) {
              return inputs[e.data.input].val(0);
            }
          }));
        }
        return results;
      };
      initShare = function() {
        var clipboard;
        share.$input.on('focus', function() {
          return $(this).trigger('select');
        });
        share.$input.on('mouseup', function(e) {
          return e.preventDefault();
        });
        if (Clipboard && Clipboard.isSupported()) {
          clipboard = new Clipboard("#dremiocalc-button");
          return clipboard.on('success', function(e) {
            var $this, reset;
            $this = $(e.trigger);
            $this.addClass('copied');
            reset = function() {
              return $this.removeClass('copied');
            };
            return setTimeout(reset, 1500);
          });
        } else {
          return $app.find("#dremiocalc-button").remove();
        }
      };
      initVals();
      initUI();
      doCalc();
      return initShare();
    });
  };

}).call(this);
